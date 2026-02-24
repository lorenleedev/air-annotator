import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const watch = process.argv.includes("--watch");

// ── UI assembly ──────────────────────────────────────
const UI_DIR = "src/ui";
const UI_OUT = "ui.html";
const JS_ORDER = ["i18n", "lang", "theme", "core", "export", "list", "onboarding", "messages", "init"];

function buildUI() {
  const css = fs.readFileSync(path.join(UI_DIR, "styles.css"), "utf8");
  const html = fs.readFileSync(path.join(UI_DIR, "template.html"), "utf8");
  let js = "";
  for (const name of JS_ORDER) {
    js += fs.readFileSync(path.join(UI_DIR, name + ".js"), "utf8") + "\n";
  }
  const output =
    "<!-- AIR: AI-Readable Annotator v1 -->\n" +
    "<!-- Copyright (c) 2026 은결. All rights reserved. -->\n" +
    "<style>\n" + css + "</style>\n\n" +
    html + "\n" +
    "<script>\n" + js + "</script>\n";
  fs.writeFileSync(UI_OUT, output, "utf8");
  console.log("  ui.html  assembled from src/ui/");
}

buildUI();

// ── code.ts build ────────────────────────────────────
const ctx = await esbuild.context({
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "code.js",
  format: "iife",
  target: "es2015",
  charset: "utf8",
  logLevel: "info",
});

if (watch) {
  await ctx.watch();
  // Watch src/ui/ for changes and rebuild ui.html (debounced)
  let uiTimer = null;
  const watcher = fs.watch(UI_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename || !/\.(js|css|html)$/.test(filename)) return;
    if (uiTimer) clearTimeout(uiTimer);
    uiTimer = setTimeout(() => {
      console.log(`  src/ui/${filename} changed — rebuilding ui.html`);
      try { buildUI(); } catch (e) { console.error("  ui.html build error:", e.message); }
    }, 100);
  });
  watcher.on("error", (err) => { console.error("  ui watcher error:", err.message); });
  console.log("Watching for changes...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
