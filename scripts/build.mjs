import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import archiver from "archiver";

const ROOT = process.cwd();
const OUT_NAME = "extension.zip";

/**
 * @type {string[]}
 */
const INCLUDE = [
  "manifest.json",
  "icons",
  "popup",
  "utils",
  "loader.js",
  "content",
];

/**
 * @type {string}
 */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "clean-copy-"));

/**
 * @param {string} src - Source path (file or directory)
 * @param {string} dest - Destination path
 * @returns {void}
 */
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });

    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function stageFiles() {
  for (const item of INCLUDE) {
    const src = path.join(ROOT, item);
    const dest = path.join(tmpDir, item);

    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    } else {
      console.warn(`[build] Missing: ${item}`);
    }
  }
}

/**
 * @param {string} zipPath - output ZIP file path
 * @param {string} sourceDir - directory to archive
 * @returns {Promise<void>}
 */
function createZip(zipPath, sourceDir) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function build() {
  const zipPath = path.join(ROOT, OUT_NAME);

  stageFiles();

  try {
    await createZip(zipPath, tmpDir);
  } catch (err) {
    console.error("Zip creation failed:", err);
    process.exit(1);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`Built: ${OUT_NAME}`);
}

build();
