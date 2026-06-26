#!/usr/bin/env node

// Deterministic moodboard report renderer for Web Anatomy.
// Input: a report-data.json (schema webanatomy.moodboard.v1).
// Output: report.html + report.md, with every screenshot materialized into references/.
// Zero dependencies. Mirrors the conventions of the other Web Anatomy render-report.mjs scripts.

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

const TAG_CLASS = {
  COPY: "copy",
  "DESIGN-UX": "ux",
  "DESIGN/UX": "ux",
  UX: "ux",
  DESIGN: "ux",
  VISUEL: "visuel",
  VISUAL: "visuel",
  PREUVE: "preuve",
  PROOF: "preuve",
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

function validate(data) {
  if (!data || typeof data !== "object") throw new Error("report data must be an object");
  if (!data.title || typeof data.title !== "string") throw new Error("report data needs title");
  if (!data.summary || typeof data.summary !== "string") throw new Error("report data needs summary");
  if (!Array.isArray(data.sections) || data.sections.length === 0)
    throw new Error("report data needs a non-empty sections array");
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
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ext) return ext;
  } catch {
    const ext = path.extname(url).toLowerCase();
    if (ext) return ext;
  }
  return ".png";
}

// Materialize one image ref into references/. Supports remote screenshotUrl (download)
// and local screenshotPath (copy). Sets ref.localImage on success.
async function materialize(ref, stem, index, referencesDir, root) {
  const fileBase = `${String(index).padStart(2, "0")}-${slugify(stem) || "image"}`;

  // already materialized?
  if (ref.localImage) {
    const existing = path.resolve(root, ref.localImage);
    if (!hasFlag("--force-download") && (await hasContent(existing))) return true;
  }

  // local file copy
  if (ref.screenshotPath) {
    try {
      const src = path.resolve(root, ref.screenshotPath);
      const buffer = await fs.readFile(src);
      const ext = path.extname(src).toLowerCase() || ".png";
      const target = path.join(referencesDir, `${fileBase}${ext}`);
      await fs.writeFile(target, buffer);
      ref.localImage = path.relative(root, target).split(path.sep).join("/");
      delete ref.screenshotUnavailableReason;
      return true;
    } catch (error) {
      ref.screenshotUnavailableReason = `local copy failed: ${error instanceof Error ? error.message : String(error)}`;
      return true;
    }
  }

  // remote download
  if (ref.screenshotUrl) {
    try {
      const response = await fetch(ref.screenshotUrl, {
        headers: { "User-Agent": "WebAnatomyMoodboardRenderer/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.toLowerCase().startsWith("image/"))
        throw new Error(`not an image (${contentType})`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) throw new Error("empty image response");
      const target = path.join(referencesDir, `${fileBase}${inferExt(ref.screenshotUrl, contentType)}`);
      await fs.writeFile(target, buffer);
      ref.localImage = path.relative(root, target).split(path.sep).join("/");
      delete ref.screenshotUnavailableReason;
      return true;
    } catch (error) {
      ref.screenshotUnavailableReason = `download failed: ${error instanceof Error ? error.message : String(error)}`;
      return true;
    }
  }

  ref.screenshotUnavailableReason ||= "screenshot unavailable";
  return true;
}

async function downloadAll(data, inputPath) {
  const root = path.dirname(inputPath);
  const referencesDir = path.join(root, "references");
  await fs.mkdir(referencesDir, { recursive: true });

  // references/ is renderer-owned. Clear our generated NN- files first so a
  // re-render after a section count/order change does not leave orphans
  // (e.g. an old 01-hero-* alongside a new 02-hero-*). Source captures must
  // live outside references/ (referenced via screenshotPath), never inside it.
  for (const f of await fs.readdir(referencesDir)) {
    if (/^\d{2,}-/.test(f)) await fs.rm(path.join(referencesDir, f), { force: true });
  }

  let i = 0;
  for (const [s, section] of data.sections.entries()) {
    const slug = slugify(section.name) || `section-${s + 1}`;
    if (section.current) await materialize(section.current, `${slug}-actuel`, ++i, referencesDir, root);
    for (const [b, bench] of (section.benchmarks ?? []).entries())
      await materialize(bench, `${slug}-${bench.company || "bench"}-${b + 1}`, ++i, referencesDir, root);
  }
  await fs.writeFile(inputPath, `${JSON.stringify(data, null, 2)}\n`);
}

function shot(ref, { tall = false } = {}) {
  const image = ref?.localImage || ref?.screenshotUrl;
  const cap = ref?.caption ? `<span>${html(ref.caption)}</span>` : "";
  if (!image) {
    return `<div class="shot unavailable"><span>${html(ref?.screenshotUnavailableReason || "screenshot unavailable")}</span></div>`;
  }
  return `<a class="shot${tall ? " tall" : ""}" href="${attr(image)}"><img src="${attr(image)}" alt="${attr(ref.alt || ref.caption || "")}" loading="lazy" />${cap}</a>`;
}

function source(ref) {
  if (!ref.sourceUrl) return "";
  let host = ref.sourceUrl;
  try {
    host = new URL(ref.sourceUrl).hostname.replace(/^www\./, "");
  } catch {}
  return `<a class="src" href="${attr(ref.sourceUrl)}" target="_blank" rel="noopener">${html(host)} &#8599;</a>`;
}

function practiceItem(raw) {
  const m = String(raw).match(/^\s*\[([^\]]+)\]\s*(.*)$/);
  const tag = m ? m[1].trim() : "";
  let rest = m ? m[2] : String(raw);
  const cls = TAG_CLASS[tag.toUpperCase()] || "ux";
  let src = "";
  const dot = rest.lastIndexOf(" · ");
  if (dot > -1) {
    src = rest.slice(dot + 3);
    rest = rest.slice(0, dot);
  }
  const tagHtml = tag ? `<span class="tag ${cls}">${html(tag)}</span>` : "";
  return `<li>${tagHtml}<span>${inline(rest)}${src ? ` <span class="src-inline">· ${html(src)}</span>` : ""}</span></li>`;
}

function renderSection(section, index) {
  const slug = slugify(section.name) || `section-${index + 1}`;
  const meta = (section.meta ?? [])
    .map((m) => `<span class="chip${m.kind ? " " + html(m.kind) : ""}">${html(m.label ?? m)}</span>`)
    .join("");
  const problems = (section.problems ?? []).map((p) => `<li>${inline(p)}</li>`).join("");
  const benches = (section.benchmarks ?? [])
    .map(
      (b) =>
        `<div class="bcard">${shot(b)}<div class="bbody"><h4>${html(b.company || b.title || "Benchmark")}${source(b)}</h4><p>${inline(b.bestPractice || b.insight || "")}</p></div></div>`,
    )
    .join("");
  const practices = (section.bestPractices ?? []).map(practiceItem).join("");
  const recos = (section.recommendations ?? [])
    .map((r) => (typeof r === "string" ? `<li>${inline(r)}</li>` : `<li><strong>${html(r.title)}.</strong> ${inline(r.text || r.how || "")}</li>`))
    .join("");

  return `<section class="module" id="${attr(slug)}">
  <div class="mod-head"><h2>${section.emoji ? html(section.emoji) + " " : ""}${html(section.name)}</h2><div class="chips">${meta}</div></div>
  <div class="r1">
    <div class="col-current">${shot(section.current || {}, { tall: true })}</div>
    <aside class="problems">
      <p class="blocklabel red">Problèmes identifiés</p>
      ${section.currentState ? `<p class="etat"><strong>État actuel ·</strong> ${inline(section.currentState)}</p>` : ""}
      <ul>${problems}</ul>
    </aside>
  </div>
  ${benches ? `<p class="blocklabel green">Benchmarks · bonnes pratiques observées</p><div class="bench-grid">${benches}</div>` : ""}
  <div class="r3">
    ${practices ? `<div class="bp-box"><p class="blocklabel">Bonnes pratiques (par discipline)</p><ul class="bp-list">${practices}</ul></div>` : ""}
    ${recos ? `<div class="reco-box"><p class="blocklabel green">Recommandation pour ${html(data.brand || "la marque")}</p><ol>${recos}</ol></div>` : ""}
  </div>
</section>`;
}

let data; // referenced inside renderSection for brand label

function renderHtml(d) {
  const nav = d.sections
    .map((s) => `<a href="#${attr(slugify(s.name) || "section")}">${s.emoji ? html(s.emoji) + " " : ""}${html(s.name)}</a>`)
    .join("");
  const body = d.sections.map(renderSection).join("\n");
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${html(d.title)}</title>
<style>
:root{--bg:#fafaf9;--ink:#1c1917;--muted:#57534e;--line:#e7e5e4;--card:#fff;--accent:#2563eb;--red:#b91c1c;--orange:#b45309;--green:#15803d;--copy:#2563eb;--ux:#7c3aed;--visuel:#0d9488;--preuve:#b45309}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Arial,sans-serif}
a{color:var(--accent);text-decoration:none}
.topbar{position:sticky;top:0;z-index:20;background:rgba(250,250,249,.88);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.topbar .inner{max-width:1160px;margin:0 auto;padding:12px 28px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.topbar .name{font-weight:700;font-size:14px}.topbar .name small{color:var(--muted);font-weight:500;margin-left:8px}
.nav{display:flex;gap:7px;flex-wrap:wrap;margin-left:auto}
.nav a{font-size:12.5px;color:var(--muted);padding:5px 11px;border:1px solid var(--line);border-radius:999px;background:var(--card)}
.nav a:hover{color:var(--ink);border-color:var(--accent)}
.wrap{max-width:1160px;margin:0 auto;padding:48px 28px 96px}
header.head{border-bottom:1px solid var(--line);padding-bottom:26px;margin-bottom:14px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700}
h1{font-size:clamp(28px,3.6vw,40px);line-height:1.12;margin:8px 0 6px;letter-spacing:0}
.head .meta{color:var(--muted);font-size:14px}
.tldr{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:16px 20px;margin:24px 0 8px;font-size:15px}
.module{padding:40px 0;border-top:1px solid var(--line)}
.mod-head{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.mod-head h2{font-size:23px;margin:0;border:0;padding:0}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{font-size:11px;font-weight:600;color:var(--muted);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:3px 9px}
.chip.p0{color:var(--red);border-color:#f3c4c4;background:#fdecec}
.chip.do{color:var(--accent);border-color:#c7d6fb;background:#eef3fe}
.blocklabel{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px;color:var(--muted)}
.blocklabel.red{color:var(--red)}.blocklabel.green{color:var(--green)}
.r1{display:grid;grid-template-columns:1.55fr 1fr;gap:18px;align-items:start;margin-bottom:26px}
@media(max-width:860px){.r1{grid-template-columns:1fr}}
.shot{display:block;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#f5f5f4}
.shot img{display:block;width:100%;object-fit:cover;object-position:top center;max-height:340px}
.shot.tall img{max-height:520px}
.shot span{display:block;padding:8px 11px;color:var(--muted);font-size:12px;border-top:1px solid var(--line)}
.shot.unavailable{padding:16px;color:var(--muted);font-size:14px}.shot.unavailable span{border:0;padding:0}
.problems{background:#fffbf5;border:1px solid #f0dcc0;border-radius:8px;padding:16px 18px}
.problems .etat{font-size:13px;color:var(--muted);margin:0 0 12px;padding-bottom:11px;border-bottom:1px dashed var(--line)}
.problems ul{margin:0;padding-left:20px}.problems li{margin:8px 0;font-size:14px}
.bench-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:28px}
.bcard{background:var(--card);border:1px solid #cfe6d6;border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
.bcard .shot{border:0;border-bottom:1px solid var(--line);border-radius:0}
.bcard .shot img{aspect-ratio:16/10;max-height:none}
.bbody{padding:11px 14px 14px}
.bbody h4{margin:0 0 5px;font-size:14px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.bbody p{margin:0;color:var(--muted);font-size:13px}
.src{font-size:11.5px;font-weight:500;white-space:nowrap}
.r3{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
@media(max-width:860px){.r3{grid-template-columns:1fr}}
.bp-box{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:16px 18px}
.bp-list{list-style:none;margin:0;padding:0}
.bp-list li{display:flex;gap:9px;align-items:flex-start;margin:9px 0;font-size:13.5px}
.tag{flex:0 0 auto;font-size:10px;font-weight:700;letter-spacing:.02em;padding:2px 7px;border-radius:5px;margin-top:1px;white-space:nowrap;border:1px solid currentColor}
.tag.copy{color:var(--copy);background:#eef3fe}.tag.ux{color:var(--ux);background:#f3edfe}
.tag.visuel{color:var(--visuel);background:#e6f7f4}.tag.preuve{color:var(--preuve);background:#fdf2e3}
.src-inline{color:#a8a29e}
.reco-box{background:#f1faf4;border:1px solid #cfe6d6;border-left:4px solid var(--green);border-radius:8px;padding:16px 18px}
.reco-box ol{margin:0;padding-left:20px}.reco-box li{margin:9px 0;font-size:14px}.reco-box li::marker{color:var(--green);font-weight:700}
.footer{margin-top:56px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
.legend{font-size:12.5px;color:var(--muted);margin-top:8px}
.legend b.copy{color:var(--copy)}.legend b.ux{color:var(--ux)}.legend b.visuel{color:var(--visuel)}.legend b.preuve{color:var(--preuve)}
</style></head><body>
<div class="topbar"><div class="inner"><div class="name">${html(d.title)}${d.subtitle ? `<small>${html(d.subtitle)}</small>` : ""}</div><nav class="nav">${nav}</nav></div></div>
<div class="wrap">
<header class="head"><div class="eyebrow">${html(d.eyebrow || "Web Anatomy · Moodboard")}</div><h1>${html(d.title)}</h1>${d.target?.url ? `<div class="meta"><a href="${attr(d.target.url)}">${html(d.target.name || d.target.url)}</a></div>` : ""}
<div class="tldr"><strong>TL;DR.</strong> ${inline(d.summary)}</div>
<div class="legend">Disciplines : <b class="copy">COPY</b> · <b class="ux">DESIGN-UX</b> · <b class="visuel">VISUEL</b> · <b class="preuve">PREUVE</b></div>
</header>
${body}
${d.footer ? `<div class="footer">${inline(d.footer)}</div>` : ""}
</div></body></html>
`;
}

function renderMarkdown(d) {
  const lines = [`# ${d.title}`, "", `## TL;DR`, d.summary, ""];
  for (const section of d.sections) {
    lines.push(`## ${section.emoji ? section.emoji + " " : ""}${section.name}`, "");
    if (section.meta?.length) lines.push(section.meta.map((m) => m.label ?? m).join(" · "), "");
    lines.push(`### Problèmes identifiés`, "");
    if (section.currentState) lines.push(`_État actuel :_ ${section.currentState}`, "");
    for (const p of section.problems ?? []) lines.push(`- ${p}`);
    const cur = section.current?.localImage || section.current?.screenshotUrl;
    if (cur) lines.push("", `![${section.current.caption || section.name + " actuel"}](${cur})`);
    lines.push("", `### Benchmarks · bonnes pratiques`, "");
    for (const b of section.benchmarks ?? []) {
      lines.push(`**${b.company || b.title}** — ${b.bestPractice || b.insight || ""}${b.sourceUrl ? ` (${b.sourceUrl})` : ""}`);
      const img = b.localImage || b.screenshotUrl;
      if (img) lines.push(`![${b.caption || b.company || "benchmark"}](${img})`);
      lines.push("");
    }
    if (section.bestPractices?.length) {
      lines.push(`### Bonnes pratiques (par discipline)`, "");
      for (const bp of section.bestPractices) lines.push(`- ${bp}`);
      lines.push("");
    }
    if (section.recommendations?.length) {
      lines.push(`### Recommandation pour ${d.brand || "la marque"}`, "");
      section.recommendations.forEach((r, i) =>
        lines.push(`${i + 1}. ${typeof r === "string" ? r : `**${r.title}.** ${r.text || r.how || ""}`}`),
      );
      lines.push("");
    }
  }
  if (d.footer) lines.push("---", "", d.footer);
  return `${lines.join("\n").trim()}\n`;
}

const input = getArg("--input") || process.argv[2];
if (!input || input.startsWith("--")) usage();
const inputPath = path.resolve(input);
const htmlPath = path.resolve(getArg("--out-html") || defaultPath(inputPath, ".html"));
const mdPath = path.resolve(getArg("--out-md") || defaultPath(inputPath, ".md"));
data = JSON.parse(await fs.readFile(inputPath, "utf8"));
validate(data);
if (!hasFlag("--no-download")) await downloadAll(data, inputPath);
await fs.mkdir(path.dirname(htmlPath), { recursive: true });
await fs.mkdir(path.dirname(mdPath), { recursive: true });
await fs.writeFile(htmlPath, renderHtml(data));
await fs.writeFile(mdPath, renderMarkdown(data));
console.log(`html=${htmlPath}`);
console.log(`markdown=${mdPath}`);
