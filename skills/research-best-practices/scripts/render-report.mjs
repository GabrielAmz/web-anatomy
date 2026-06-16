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

const BUDGETS = {
  summaryItems: 3,
  summaryItem: 140,
  why: 220,
  howItems: 5,
  howItem: 160,
  insight: 200,
  gapRows: 6,
  gapCell: 90,
  workingMin: 2,
  workingMax: 4,
  workingItem: 140,
  snapshotItems: 6,
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
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalize(data) {
  const v2 = Array.isArray(data.summary);
  const summary = Array.isArray(data.summary) ? data.summary : data.summary ? [data.summary] : [];
  const references = (data.references ?? []).map((ref, i) => ({
    ...ref,
    id:
      ref.id ||
      slugify([ref.company, ref.section].filter(Boolean).join("-")) ||
      slugify(ref.title) ||
      `ref-${i + 1}`,
  }));
  const recommendations = (data.recommendations ?? []).map((rec) => ({
    ...rec,
    how: Array.isArray(rec.how) ? rec.how : rec.how ? [rec.how] : [],
    refIds: rec.refIds ?? [],
  }));
  return { ...data, v2, summary, references, recommendations, working: data.working ?? [] };
}

function validate(data) {
  if (!data || typeof data !== "object") throw new Error("report data must be an object");

  const errors = [];
  const over = (value, max, label) => {
    const length = String(value ?? "").length;
    if (length > max) errors.push(`${label} is ${length} chars (max ${max}). Rewrite it shorter; cut fluff, keep the verb.`);
  };

  if (!data.title || typeof data.title !== "string") errors.push("report data needs title");
  if (!data.summary.length) errors.push("report data needs summary (array of bullets)");

  const refIds = new Set();
  for (const ref of data.references) {
    if (refIds.has(ref.id)) errors.push(`duplicate reference id "${ref.id}"`);
    refIds.add(ref.id);
  }
  for (const [i, rec] of data.recommendations.entries()) {
    for (const id of rec.refIds) {
      if (!refIds.has(id)) errors.push(`recommendation ${i + 1} refIds points to unknown reference "${id}"`);
    }
  }

  if (data.v2) {
    if (data.summary.length > BUDGETS.summaryItems) errors.push(`summary has ${data.summary.length} bullets (max ${BUDGETS.summaryItems})`);
    data.summary.forEach((item, i) => over(item, BUDGETS.summaryItem, `summary[${i}]`));

    data.recommendations.forEach((rec, i) => {
      over(rec.why, BUDGETS.why, `recommendations[${i}].why`);
      if (rec.how.length > BUDGETS.howItems) errors.push(`recommendations[${i}].how has ${rec.how.length} bullets (max ${BUDGETS.howItems})`);
      rec.how.forEach((item, j) => over(item, BUDGETS.howItem, `recommendations[${i}].how[${j}]`));
    });

    data.references.forEach((ref, i) => over(ref.insight, BUDGETS.insight, `references[${i}].insight`));

    const grounded = data.recommendations.filter((rec) => rec.refIds.length > 0).length;
    const minGrounded = Math.min(3, data.recommendations.length);
    if (!data.ungrounded && grounded < minGrounded) {
      errors.push(
        `only ${grounded} recommendation(s) carry refIds (min ${minGrounded}). Search benchmarks for the other sections (hero, faq, ...) and attach 1-3 references each, or set "ungrounded": true if the MCP is unavailable.`,
      );
    }

    const gaps = data.gapAnalysis ?? [];
    if (gaps.length > BUDGETS.gapRows) errors.push(`gapAnalysis has ${gaps.length} rows (max ${BUDGETS.gapRows})`);
    gaps.forEach((row, i) => {
      over(row.current, BUDGETS.gapCell, `gapAnalysis[${i}].current`);
      over(row.strongPattern, BUDGETS.gapCell, `gapAnalysis[${i}].strongPattern`);
    });

    if (data.working.length && (data.working.length < BUDGETS.workingMin || data.working.length > BUDGETS.workingMax)) {
      errors.push(`working needs ${BUDGETS.workingMin}-${BUDGETS.workingMax} bullets when present (got ${data.working.length})`);
    }
    data.working.forEach((item, i) => over(item, BUDGETS.workingItem, `working[${i}]`));

    if ((data.currentSnapshot ?? []).length > BUDGETS.snapshotItems) {
      errors.push(`currentSnapshot has ${data.currentSnapshot.length} items (max ${BUDGETS.snapshotItems}); merge or cut`);
    }
  }

  if (errors.length) {
    throw new Error(`report data failed validation:\n- ${errors.join("\n- ")}`);
  }
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

async function downloadReferences(data, inputPath, raw) {
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

  if (changed) {
    // Persist only the download results onto the raw input shape, so a legacy
    // (pre-v2) report-data.json is never rewritten into the normalized shape.
    const rawRefs = Array.isArray(raw?.references) ? raw.references : [];
    data.references.forEach((ref, i) => {
      if (!rawRefs[i]) return;
      if (ref.localImage) rawRefs[i].localImage = ref.localImage;
      if (ref.screenshotUnavailableReason) {
        rawRefs[i].screenshotUnavailableReason = ref.screenshotUnavailableReason;
      } else {
        delete rawRefs[i].screenshotUnavailableReason;
      }
    });
    await fs.writeFile(inputPath, `${JSON.stringify(raw ?? data, null, 2)}\n`);
  }
}

function caption(ref) {
  return ref.caption || [ref.company, ref.section, "screenshot"].filter(Boolean).join(" ");
}

function source(ref) {
  if (!ref.sourceUrl) return "";
  const host = new URL(ref.sourceUrl).hostname.replace(/^www\./, "");
  return ` <a class="src" href="${attr(ref.sourceUrl)}">${html(host)}</a>`;
}

function refThumb(ref, label) {
  const image = ref.localImage || ref.screenshotUrl;
  const tag = label ? `<span class="opt">${html(label)}</span>` : "";
  const cap = `<figcaption><strong>${html(ref.company || ref.title)}</strong>${source(ref)}<span>${inline(ref.insight || "")}</span></figcaption>`;
  if (!image) {
    return `<figure class="refcard">${tag}<div class="noimg">${html(ref.screenshotUnavailableReason || "screenshot unavailable")}</div>${cap}</figure>`;
  }
  return `<figure class="refcard">${tag}<a class="shot" href="${attr(image)}"><img src="${attr(image)}" alt="${attr(ref.alt || caption(ref))}" loading="lazy" /></a>${cap}</figure>`;
}

function renderHtml(data, htmlPath) {
  const refMap = new Map(data.references.map((ref) => [ref.id, ref]));
  const claimed = new Set(data.recommendations.flatMap((rec) => rec.refIds));

  const summary = data.summary.length
    ? `<div class="tldr"><p><strong>TL;DR:</strong> ${inline(data.summary[0])}</p>${
        data.summary.length > 1 ? `<ul>${data.summary.slice(1).map((item) => `<li>${inline(item)}</li>`).join("")}</ul>` : ""
      }</div>`
    : "";

  const recs = data.recommendations
    .map((rec, i) => {
      const chips = [
        rec.priority ? `<span class="gap ${html(String(rec.priority).toLowerCase())}">${html(rec.priority)}</span>` : "",
        rec.kind ? `<span class="kind">${html(rec.kind)}</span>` : "",
        i === 0 ? `<span class="ribbon">Start here</span>` : "",
      ].filter(Boolean).join(" ");
      const how = rec.how.length ? `<ul class="how">${rec.how.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>` : "";
      const refs = rec.refIds.map((id) => refMap.get(id)).filter(Boolean);
      const labeled = refs.length >= 2;
      const strip = refs.length
        ? `<div class="inspired"><div class="inspired-label">Inspired by</div><div class="refstrip">${refs
            .map((ref, j) => refThumb(ref, labeled ? String.fromCharCode(65 + j) : null))
            .join("")}</div></div>`
        : "";
      const prompt = rec.prompt
        ? `<details class="prompt copyable"><summary>Copy this prompt into your agent</summary><div class="prompt-body"><button type="button" class="copy-btn">Copy</button><pre>${html(rec.prompt)}</pre></div></details>`
        : "";
      return `<section class="rec${i === 0 ? " lead" : ""}">
<div class="rec-head"><span class="num">${i + 1}</span><h3>${html(rec.title)}</h3>${chips}</div>
${rec.why ? `<p class="why">${inline(rec.why)}</p>` : ""}
${how}${strip}${prompt}
</section>`;
    })
    .join("\n");

  const working = data.working.length
    ? `<h2>${html(data.workingHeading || "What's working (keep these)")}</h2><ul class="working">${data.working.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`
    : "";

  const gaps = (data.gapAnalysis ?? [])
    .map((row) => `<tr><td>${inline(row.dimension)}</td><td>${inline(row.current)}</td><td>${inline(row.strongPattern)}</td><td><span class="gap ${html(String(row.gap).toLowerCase())}">${html(row.gap)}</span></td></tr>`)
    .join("\n");

  const gallery = data.references.filter((ref) => !claimed.has(ref.id));
  const galleryHtml = gallery.length
    ? `<h2>All references</h2><div class="refstrip gallery">${gallery.map((ref) => refThumb(ref, null)).join("")}</div>`
    : "";

  const snapshot = (data.currentSnapshot ?? [])
    .map((item) => `<li>${item.label ? `<strong>${html(item.label)}.</strong> ` : ""}${inline(item.text || item)}</li>`)
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${html(data.title)}</title>
<style>
:root{--ink:#1f2328;--mut:#57606a;--line:#d0d7de;--soft:#eef4fb;--accent:#0969da;--high:#b91c1c;--med:#b45309;--low:#15803d}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Arial,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:48px 24px 96px}
header{padding-bottom:20px;margin-bottom:20px;border-bottom:2px solid var(--ink)}
.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);font-weight:700}
h1{font-size:clamp(28px,4vw,38px);line-height:1.15;margin:6px 0;letter-spacing:-.01em}
h2{font-size:21px;margin:52px 0 16px}
h3{font-size:18px;margin:0;flex:1;min-width:200px}
p{margin:0 0 12px}a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
ul,ol{margin:0 0 12px;padding-left:22px}li{margin-bottom:5px}
.meta{color:var(--mut);font-size:14px}
.tldr{background:var(--soft);border-left:4px solid var(--accent);border-radius:4px;padding:18px 22px;margin:28px 0}
.tldr p{margin:0}.tldr ul{margin:10px 0 0;padding-left:20px}.tldr li{margin-bottom:6px}
.prompt pre{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid var(--line);border-radius:6px;padding:12px 13px;margin:0;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ink)}
.copy-btn{font:600 12px/1 inherit;cursor:pointer;border:1px solid var(--accent);color:var(--accent);background:#fff;border-radius:6px;padding:5px 11px}
.copy-btn:hover{background:var(--accent);color:#fff}
.rec{border-top:1px solid var(--line);padding:24px 0 28px}
.rec-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.num{flex:none;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;background:#111;color:#fff;font-weight:700;font-size:14px;border-radius:6px}
.ribbon{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:#111;color:#fff}
.why{color:var(--mut);margin-bottom:10px}
.how{margin-bottom:14px}
.gap{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700}
.gap.high{background:#fee2e2;color:var(--high)}.gap.medium{background:#fef3c7;color:var(--med)}.gap.low{background:#dcfce7;color:var(--low)}
.kind{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#e0e7ff;color:#3730a3;text-transform:capitalize}
.inspired{margin:14px 0}
.inspired-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin-bottom:8px}
.refstrip{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.refstrip.gallery{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.refcard{margin:0;position:relative;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 4px rgba(31,35,40,.06)}
.refcard .opt{position:absolute;top:8px;left:8px;z-index:2;width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:#111;color:#fff;font-weight:700;font-size:12px;border-radius:6px}
.refcard .shot{display:block}
.refcard img{display:block;width:100%;height:150px;object-fit:cover;object-position:top center;cursor:zoom-in}
.refcard .noimg{height:150px;display:flex;align-items:center;justify-content:center;background:#f6f8fa;color:var(--mut);font-size:13px;padding:12px;text-align:center}
.refcard figcaption{padding:8px 10px;font-size:12.5px;line-height:1.45;color:var(--mut)}
.refcard figcaption strong{color:var(--ink);display:inline-block;margin-right:4px}
.refcard figcaption span{display:block;margin-top:3px}
.refcard .src{font-size:11px}
.prompt{margin-top:12px;border:1px solid var(--line);border-radius:8px;background:#fafbfc}
.prompt summary{cursor:pointer;padding:8px 12px;font-size:13px;font-weight:600;color:var(--accent)}
.prompt-body{position:relative;padding:0 12px 12px}
.prompt-body .copy-btn{position:absolute;top:8px;right:20px}
.working{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px 14px 34px;margin:0 0 12px}
table{width:100%;border-collapse:collapse;margin:12px 0 24px;font-size:14px}
th,td{border-bottom:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
th{background:#f6f8fa;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut)}
.snapshot{margin-top:40px;border:1px solid var(--line);border-radius:8px;padding:4px 14px;color:var(--mut)}
.snapshot summary{cursor:pointer;padding:8px 0;font-weight:600;color:var(--ink)}
.snapshot ul{padding:4px 0 10px 22px}
#lightbox{position:fixed;inset:0;display:none;background:rgba(31,35,40,.92);z-index:50;cursor:zoom-out;padding:32px}
#lightbox.open{display:flex;align-items:center;justify-content:center}
#lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px}
.footer{margin-top:48px;padding-top:16px;border-top:1px solid var(--line);color:var(--mut);font-size:13px}
</style></head><body><div class="wrap">
<header><div class="eyebrow">${html(data.eyebrow || "Web Anatomy")}</div><h1>${html(data.title)}</h1>${data.subtitle ? `<div class="meta">${html(data.subtitle)}</div>` : ""}${data.target?.url ? `<div class="meta"><a href="${attr(data.target.url)}">${html(data.target.name || data.target.url)}</a></div>` : ""}</header>
${summary}
${recs ? `<h2>${html(data.recommendationsHeading || "Recommendations")}</h2>${recs}` : ""}
${working}
${gaps ? `<h2>${html(data.gapAnalysisHeading || "Gap analysis")}</h2><table><thead><tr><th>Dimension</th><th>Current</th><th>Strong pattern</th><th>Gap</th></tr></thead><tbody>${gaps}</tbody></table>` : ""}
${galleryHtml}
${snapshot ? `<details class="snapshot"><summary>Current reality (context)</summary><ul>${snapshot}</ul></details>` : ""}
${data.footer ? `<div class="footer">${inline(data.footer)}</div>` : ""}
</div>
<div id="lightbox"><img alt="" /></div>
<script>
function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  try { document.execCommand("copy"); } catch {}
  area.remove();
  done();
}
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".copy-btn");
  if (btn) {
    const text = btn.closest(".copyable").querySelector("pre").innerText;
    const done = () => { btn.textContent = "Copied"; setTimeout(() => { btn.textContent = "Copy"; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
    return;
  }
  const shotLink = event.target.closest("a.shot");
  if (shotLink) {
    const img = shotLink.querySelector("img");
    if (!img) return;
    event.preventDefault();
    const overlay = document.getElementById("lightbox");
    overlay.querySelector("img").src = img.src;
    overlay.classList.add("open");
    return;
  }
  const overlay = event.target.closest("#lightbox");
  if (overlay) overlay.classList.remove("open");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") document.getElementById("lightbox").classList.remove("open");
});
</script>
</body></html>
`;
}

function renderMarkdown(data, htmlPath) {
  const refMap = new Map(data.references.map((ref) => [ref.id, ref]));
  const claimed = new Set(data.recommendations.flatMap((rec) => rec.refIds));
  const lines = [`# ${data.title}`, ""];

  if (data.summary.length) {
    lines.push(`**TL;DR:** ${data.summary[0]}`, "");
    if (data.summary.length > 1) lines.push(...data.summary.slice(1).map((item) => `- ${item}`), "");
  }

  if (data.recommendations.length) {
    lines.push(`## ${data.recommendationsHeading || "Recommendations"}`, "");
    data.recommendations.forEach((rec, i) => {
      const tags = [rec.priority, rec.kind].filter(Boolean).join(" · ");
      lines.push(`### ${i + 1}. ${rec.title}${tags ? ` [${tags}]` : ""}${i === 0 ? " (start here)" : ""}`, "");
      if (rec.why) lines.push(rec.why, "");
      if (rec.how.length) lines.push(...rec.how.map((item) => `- ${item}`), "");
      const refs = rec.refIds.map((id) => refMap.get(id)).filter(Boolean);
      const labeled = refs.length >= 2;
      refs.forEach((ref, j) => {
        const image = ref.localImage || ref.screenshotUrl;
        const label = labeled ? `Option ${String.fromCharCode(65 + j)} · ` : "";
        lines.push(`**${label}${ref.company || ref.title}.** ${ref.insight || ""}`, "");
        lines.push(image ? `![${caption(ref)}](${image})` : `Screenshot: ${ref.screenshotUnavailableReason || "screenshot unavailable"}`, "");
      });
      if (rec.prompt) lines.push(`Prompt: \`${rec.prompt.replace(/`/g, "'")}\``, "");
    });
  }

  if (data.working.length) {
    lines.push(`## ${data.workingHeading || "What's working (keep these)"}`, "", ...data.working.map((item) => `- ${item}`), "");
  }

  const gaps = data.gapAnalysis ?? [];
  if (gaps.length) {
    lines.push(`## ${data.gapAnalysisHeading || "Gap analysis"}`, "", "| Dimension | Current | Strong pattern | Gap |", "|---|---|---|---|");
    gaps.forEach((row) => lines.push(`| ${row.dimension} | ${row.current} | ${row.strongPattern} | ${row.gap} |`));
    lines.push("");
  }

  const gallery = data.references.filter((ref) => !claimed.has(ref.id));
  if (gallery.length) {
    lines.push("## All references", "");
    for (const ref of gallery) {
      const image = ref.localImage || ref.screenshotUrl;
      lines.push(`**${ref.company || ref.title}.** ${ref.insight || ""}`, "");
      lines.push(image ? `![${caption(ref)}](${image})` : `Screenshot: ${ref.screenshotUnavailableReason || "screenshot unavailable"}`, "");
    }
  }

  const snapshot = data.currentSnapshot ?? [];
  if (snapshot.length) {
    lines.push("## Current reality (context)", "", ...snapshot.map((item) => `- ${item.label ? `**${item.label}.** ` : ""}${item.text || item}`), "");
  }

  if (data.footer) lines.push("---", "", data.footer, "");

  return `${lines.join("\n").trim()}\n`;
}

const input = getArg("--input") || process.argv[2];
if (!input || input.startsWith("--")) usage();

const inputPath = path.resolve(input);
const htmlPath = path.resolve(getArg("--out-html") || defaultPath(inputPath, ".html"));
const mdPath = path.resolve(getArg("--out-md") || defaultPath(inputPath, ".md"));
const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));
const data = normalize(raw);
validate(data);

if (!hasFlag("--no-download")) await downloadReferences(data, inputPath, raw);

await fs.mkdir(path.dirname(htmlPath), { recursive: true });
await fs.mkdir(path.dirname(mdPath), { recursive: true });
await fs.writeFile(htmlPath, renderHtml(data, htmlPath));
await fs.writeFile(mdPath, renderMarkdown(data, htmlPath));
console.log(`html=${htmlPath}`);
console.log(`markdown=${mdPath}`);
