const fs = require("node:fs/promises");
const nodeFs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { spawn } = require("node:child_process");

const FFMPEG_DOWNLOAD_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip";
const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1080&h=1920&q=80"
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(
        `${command} exited with code ${code}${stderr ? `\n${stderr.trim()}` : ""}`
      );
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

async function downloadToFile(url, destination) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "vertical-video-generator/1.0"
    },
    redirect: "follow"
  });

  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${url} with status ${response.status}`);
  }

  await ensureDir(path.dirname(destination));
  await pipeline(Readable.fromWeb(response.body), nodeFs.createWriteStream(destination));
}

async function findFileRecursive(rootDir, fileName) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const nestedMatch = await findFileRecursive(fullPath, fileName);
      if (nestedMatch) {
        return nestedMatch;
      }
    }
  }

  return null;
}

async function resolveBundledFfmpeg(ffmpegDir) {
  if (!(await exists(ffmpegDir))) {
    return null;
  }

  return findFileRecursive(ffmpegDir, "ffmpeg.exe");
}

async function hasSystemFfmpeg() {
  try {
    await runCommand("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

async function extractZipOnWindows(zipPath, destinationDir) {
  const command = `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destinationDir}' -Force`;
  await runCommand("powershell.exe", [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    command
  ]);
}

async function ensureFfmpeg(projectRoot) {
  const ffmpegDir = path.join(projectRoot, "ffmpeg");
  const bundledBinary = await resolveBundledFfmpeg(ffmpegDir);
  if (bundledBinary) {
    return bundledBinary;
  }

  if (await hasSystemFfmpeg()) {
    return "ffmpeg";
  }

  if (process.platform !== "win32") {
    throw new Error("FFmpeg was not found and automatic download is only configured for Windows.");
  }

  await ensureDir(ffmpegDir);

  const archivePath = path.join(ffmpegDir, "ffmpeg-release-essentials.zip");
  if (!(await exists(archivePath))) {
    await downloadToFile(FFMPEG_DOWNLOAD_URL, archivePath);
  }

  await extractZipOnWindows(archivePath, ffmpegDir);

  const extractedBinary = await resolveBundledFfmpeg(ffmpegDir);
  if (!extractedBinary) {
    throw new Error("FFmpeg was downloaded but ffmpeg.exe was not found after extraction.");
  }

  return extractedBinary;
}

async function downloadImages(projectRoot) {
  const imagesDir = path.join(projectRoot, "images");
  await ensureDir(imagesDir);

  const imagePaths = [];

  for (const [index, imageUrl] of IMAGE_URLS.entries()) {
    const imagePath = path.join(imagesDir, `img${index}.jpg`);
    await downloadToFile(imageUrl, imagePath);
    imagePaths.push(imagePath);
  }

  return imagePaths;
}

async function createVerticalVideo({ ffmpegPath, imagePaths, outputPath }) {
  const inputArgs = imagePaths.flatMap((imagePath) => ["-loop", "1", "-t", "4", "-i", imagePath]);
  const videoFilters = imagePaths
    .map(
      (_, index) =>
        `[${index}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${index}]`
    )
    .join(";");
  const concatInputs = imagePaths.map((_, index) => `[v${index}]`).join("");
  const filterComplex = `${videoFilters};${concatInputs}concat=n=${imagePaths.length}:v=1:a=0,format=yuv420p[vout]`;

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[vout]",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-movflags",
    "+faststart",
    outputPath
  ];

  await runCommand(ffmpegPath, args);
}

module.exports = {
  createVerticalVideo,
  downloadImages,
  ensureFfmpeg
};