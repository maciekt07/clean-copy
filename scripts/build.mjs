import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import archiver from "archiver";
import { build as esbuild } from "esbuild";
import { minify as minifyHtml } from "html-minifier-terser";
import { transform as transformCss } from "lightningcss";

/**
 * project root
 * @type {string}
 */
const ROOT = process.cwd();

/**
 * output ZIP filename
 * @type {string}
 */
const OUT_NAME = "extension.zip";

/**
 * static files and folders copied as is
 * @type {string[]}
 */
const STATIC_ASSETS = ["icons"];

/**
 * @type {string[]}
 */
const JS_ENTRY_POINTS = ["loader.js", "content/cleanCopy.js", "popup/popup.js"];

/**
 * @type {string}
 */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "clean-copy-"));

/**
 * copy a file or directory recursively
 * @param {string} src
 * @param {string} dest
 * @returns {void}
 */
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });

    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * @returns {void}
 */
function copyStaticAssets() {
  for (const item of STATIC_ASSETS) {
    const src = path.join(ROOT, item);
    const dest = path.join(tmpDir, item);

    if (!fs.existsSync(src)) {
      console.warn(`[build] Missing static asset: ${item}`);
      continue;
    }

    copyRecursive(src, dest);
  }
}

/**
 * Minify popup HTML for the packaged extension.
 * @returns {Promise<void>}
 */
async function writePopupHtml() {
  const sourcePath = path.join(ROOT, "popup/popup.html");
  const destPath = path.join(tmpDir, "popup/popup.html");
  const source = fs.readFileSync(sourcePath, "utf8");
  const minified = await minifyHtml(source, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
  });

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, `${minified}\n`);
}

/**
 * Minify popup CSS for the packaged extension.
 * @returns {void}
 */
function writePopupCss() {
  const sourcePath = path.join(ROOT, "popup/popup.css");
  const destPath = path.join(tmpDir, "popup/popup.css");
  const source = fs.readFileSync(sourcePath);
  const result = transformCss({
    filename: sourcePath,
    code: source,
    minify: true,
  });

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, result.code);
}

/**
 * @returns {void}
 */
function writeManifest() {
  const manifestPath = path.join(ROOT, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  manifest.web_accessible_resources = [
    {
      resources: ["content/cleanCopy.js"],
      matches: ["<all_urls>"],
    },
  ];

  fs.writeFileSync(
    path.join(tmpDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

/**
 * @returns {Promise<void>}
 */
async function bundleScripts() {
  await esbuild({
    absWorkingDir: ROOT,
    entryPoints: JS_ENTRY_POINTS,
    outdir: tmpDir,
    bundle: true,
    minify: true,
    format: "esm",
    target: ["chrome109"],
    legalComments: "none",
    treeShaking: true,
  });
}

/**
 * create a ZIP archive from the prepared package directory
 * @param {string} zipPath
 * @param {string} sourceDir
 * @returns {Promise<void>}
 */
function createZip(zipPath, sourceDir) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * build the optimized extension package
 * @returns {Promise<void>}
 */
async function build() {
  const zipPath = path.join(ROOT, OUT_NAME);

  try {
    copyStaticAssets();
    await writePopupHtml();
    writePopupCss();
    writeManifest();
    await bundleScripts();
    await createZip(zipPath, tmpDir);
    console.log(`Built optimized package: ${OUT_NAME}`);
  } catch (error) {
    console.error("Build failed:", error);
    process.exitCode = 1;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

await build();
