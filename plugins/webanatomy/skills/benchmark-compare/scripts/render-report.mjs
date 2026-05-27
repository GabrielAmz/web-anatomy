#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const imageTypes = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const getArg = (name) => {
  const item = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1).trim() : null;
};

const hasFlag = (name) => process.argv.includes(name);

function usage() {
  throw new Error(
    "Usage: node scripts/render-report.mjs --input=.webanatomy/.../report-data.json [--no-download]",
  );
}

function html(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function attr(value) {
  return html(value).replace(/`/g, "&#96;");
}

function inline(value) {
  return html(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function validate(data) {
  if (!data || typeof data !== "object") throw new Error("report data must be an object");
  if (!data.title || typeof data.title !== "string") throw new Error("report data needs title");
  if (!data.summary || typeof data.summary !== "string") throw new Error("report data needs summary");
}

function defaultPath(inputPath, extension) {
  const base = path.basename(inputPath).replace(/-data\.json$/i, "").replace(/\.json$/i, "");
  return path.join(path.dirname(inputPath), `${base}${extension}`);
}

async function hasContent(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

function inferExt(url, contentType) {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase();
  if (normalized && imageTypes[normalized]) return imageTypes[normalized];
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return ext || ".png";
}

async function downloadReferences(data, inputPath) {
  const root = path.dirname(inputPath);
  const referencesDir = path.join(root, "references");
  await fs.mkdir(referencesDir, { recursive: true });

  let changed = false;
  for (const [index, ref] of (data.references ?? []).entries()) {
    if (!ref.screenshotUrl) {
      ref.screenshotUnavailableReason ||= "screenshot unavailable";
      changed = true;
      continue;
    }

    const existing = ref.localImage ? path.resolve(root, ref.localImage) : null;
    if (existing && !hasFlag("--force-download") && (await hasContent(existing))) continue;

    try {
      const response = await fetch(ref.screenshotUrl, {
        headers: { "User-Agent": "WebAnatomyReportRenderer/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.toLowerCase().startsWith("image/")) {
        throw new Error(`not an image (${contentType})`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) throw new Error("empty image response");

      const stem =
        slugify([ref.company, ref.section].filter(Boolean).join("-")) ||
        slugify(ref.title) ||
        "reference";
      const fileName = `${String(index + 1).padStart(2, "0")}-${stem}${inferExt(ref.screenshotUrl, contentType)}`;
      const target = path.join(referencesDir, fileName);

      await fs.writeFile(target, buffer);
      ref.localImage = path.relative(root, target).split(path.sep).join("/");
      delete ref.screenshotUnavailableReason;
      changed = true;
    } catch (error) {
      ref.screenshotUnavailableReason = `local download failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      changed = true;
    }
  }

  if (changed) await fs.writeFile(inputPath, `${JSON.stringify(data, null, 2)}\n`);
}

function caption(ref) {
  return ref.caption || [ref.company, ref.section, "screenshot"].filter(Boolean).join(" ");
}

function shot(ref) {
  const image = ref.localImage || ref.screenshotUrl;
  if (!image) {
    return `<div class="shot unavailable"><span>${html(ref.screenshotUnavailableReason || "screenshot unavailable")}</span></div>`;
  }

  return `<a class="shot" href="${attr(image)}">
  <img src="${attr(image)}" alt="${attr(ref.alt || caption(ref))}" loading="lazy" />
  <span>${html(caption(ref))}</span>
</a>`;
}

function source(ref) {
  if (!ref.sourceUrl) return "";
  const host = new URL(ref.sourceUrl).hostname.replace(/^www\./, "");
  return ` <span class="meta">(<a href="${attr(ref.sourceUrl)}">${html(host)}</a>)</span>`;
}

function renderHtml(data) {
  const snapshot = (data.currentSnapshot ?? [])
    .map((item) => `<li>${item.label ? `<strong>${html(item.label)}.</strong> ` : ""}${inline(item.text || item)}</li>`)
    .join("\n");
  const refs = (data.references ?? [])
    .map((ref) => `<div class="card"><h3>${html(ref.title)}${source(ref)}</h3><p>${inline(ref.insight || "")}</p>${shot(ref)}</div>`)
    .join("\n");
  const recs = (data.recommendations ?? [])
    .map((rec, i) => `<div class="card"><h3>${i + 1}. ${html(rec.title)}</h3><div class="why"><strong>Why:</strong> ${inline(rec.why)}</div><div class="why"><strong>How:</strong> ${inline(rec.how)}</div></div>`)
    .join("\n");
  const gaps = (data.gapAnalysis ?? [])
    .map((row) => `<tr><td>${inline(row.dimension)}</td><td>${inline(row.current)}</td><td>${inline(row.strongPattern)}</td><td><span class="gap ${html(String(row.gap).toLowerCase())}">${html(row.gap)}</span></td></tr>`)
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${html(data.title)}</title>
<style>
:root{--bg:#fafaf9;--ink:#1c1917;--muted:#57534e;--line:#e7e5e4;--card:#fff;--accent:#2563eb;--high:#b91c1c;--med:#b45309;--low:#15803d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Arial,sans-serif}.wrap{max-width:960px;margin:0 auto;padding:56px 28px 96px}header{border-bottom:1px solid var(--line);padding-bottom:28px;margin-bottom:36px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700}h1{font-size:clamp(30px,4vw,42px);line-height:1.12;margin:8px 0;letter-spacing:0}h2{font-size:22px;margin:48px 0 12px;border-bottom:1px solid var(--line);padding-bottom:8px}h3{font-size:17px;margin:0 0 8px}p{margin:0 0 14px}a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}ul,ol{margin:0 0 14px;padding-left:22px}li{margin-bottom:6px}.meta,.why{color:var(--muted);font-size:14px}.tldr,.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:18px 22px;margin:14px 0}.tldr{border-left:4px solid var(--accent);margin-bottom:36px}.why{margin:7px 0}.why strong{color:var(--ink)}.shot{display:block;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#f5f5f4;text-decoration:none;margin-top:14px}.shot img{display:block;width:100%;max-height:380px;object-fit:cover;object-position:top center}.shot span{display:block;padding:8px 10px;color:var(--muted);font-size:12px;border-top:1px solid var(--line)}.shot.unavailable{padding:16px;color:var(--muted);font-size:14px}.shot.unavailable span{border:0;padding:0}table{width:100%;border-collapse:collapse;margin:12px 0 24px;font-size:14px}th,td{border-bottom:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}th{background:#f5f5f4;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.gap{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700}.gap.high{background:#fee2e2;color:var(--high)}.gap.medium{background:#fef3c7;color:var(--med)}.gap.low{background:#dcfce7;color:var(--low)}.footer{margin-top:64px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
</style></head><body><div class="wrap">
<header><div class="eyebrow">${html(data.eyebrow || "Web Anatomy")}</div><h1>${html(data.title)}</h1>${data.subtitle ? `<div class="meta">${html(data.subtitle)}</div>` : ""}${data.target?.url ? `<div class="meta"><a href="${attr(data.target.url)}">${html(data.target.name || data.target.url)}</a></div>` : ""}</header>
<div class="tldr"><strong>TL;DR.</strong> ${inline(data.summary)}</div>
${snapshot ? `<h2>Current Reality</h2><ul>${snapshot}</ul>` : ""}
${refs ? `<h2>${html(data.referencesHeading || "Benchmark Matches")}</h2>${refs}` : ""}
${recs ? `<h2>${html(data.recommendationsHeading || "Recommendations")}</h2>${recs}` : ""}
${gaps ? `<h2>${html(data.gapAnalysisHeading || "Gap Analysis")}</h2><table><thead><tr><th>Dimension</th><th>Current</th><th>Strong Pattern</th><th>Gap</th></tr></thead><tbody>${gaps}</tbody></table>` : ""}
${data.footer ? `<div class="footer">${inline(data.footer)}</div>` : ""}
</div></body></html>
`;
}

function renderMarkdown(data) {
  const lines = [`# ${data.title}`, "", "## TL;DR", data.summary, ""];
  for (const ref of data.references ?? []) {
    lines.push(`### ${ref.title}`, "", ref.insight || "", "");
    const image = ref.localImage || ref.screenshotUrl;
    lines.push(image ? `![${caption(ref)}](${image})` : `Screenshot: ${ref.screenshotUnavailableReason || "screenshot unavailable"}`, "");
  }
  return `${lines.join("\n").trim()}\n`;
}

const input = getArg("--input") || process.argv[2];
if (!input || input.startsWith("--")) usage();

const inputPath = path.resolve(input);
const htmlPath = path.resolve(getArg("--out-html") || defaultPath(inputPath, ".html"));
const mdPath = path.resolve(getArg("--out-md") || defaultPath(inputPath, ".md"));
const data = JSON.parse(await fs.readFile(inputPath, "utf8"));
validate(data);

if (!hasFlag("--no-download")) await downloadReferences(data, inputPath);

await fs.mkdir(path.dirname(htmlPath), { recursive: true });
await fs.mkdir(path.dirname(mdPath), { recursive: true });
await fs.writeFile(htmlPath, renderHtml(data));
await fs.writeFile(mdPath, renderMarkdown(data));
console.log(`html=${htmlPath}`);
console.log(`markdown=${mdPath}`);
