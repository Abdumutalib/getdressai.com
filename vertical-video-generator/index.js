const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const nodeFs = require("node:fs");

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1080&h=1920&q=80"
];

const DEFAULT_FFMPEG_PATH =
  "C:\\Users\\Windows 11\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe";

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function downloadFile(url, destination) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "vertical-video-generator/1.0"
    },
    redirect: "follow"
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}. Status: ${response.status}`);
  }

  await pipeline(Readable.fromWeb(response.body), nodeFs.createWriteStream(destination));
}

async function downloadImages(imagesDir) {
  const imagePaths = [];

  for (const [index, imageUrl] of IMAGE_URLS.entries()) {
    const imagePath = path.join(imagesDir, `img${index}.jpg`);
    await downloadFile(imageUrl, imagePath);
    imagePaths.push(imagePath);
  }

  return imagePaths;
}

function resolveFfmpegBinary() {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH;
  }

  return DEFAULT_FFMPEG_PATH;
}

function runFfmpeg(ffmpegPath, imagePaths, outputPath) {
  return new Promise((resolve, reject) => {
    const inputArgs = imagePaths.flatMap((imagePath) => ["-loop", "1", "-t", "4", "-i", imagePath]);
    const preparedStreams = imagePaths
      .map(
        (_, index) =>
          `[${index}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${index}]`
      )
      .join(";");
    const concatInputs = imagePaths.map((_, index) => `[v${index}]`).join("");
    const filterComplex = `${preparedStreams};${concatInputs}concat=n=${imagePaths.length}:v=1:a=0,format=yuv420p[vout]`;

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

    const ffmpeg = spawn(ffmpegPath, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(new Error(`Unable to start FFmpeg: ${error.message}`));
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`FFmpeg exited with code ${code}${stderr ? `\n${stderr.trim()}` : ""}`));
    });
  });
}

async function main() {
  const projectRoot = __dirname;
  const imagesDir = path.join(projectRoot, "images");
  const outputPath = path.join(projectRoot, "output.mp4");
  const ffmpegPath = resolveFfmpegBinary();

  await ensureDir(imagesDir);

  console.log("Downloading images...");
  const imagePaths = await downloadImages(imagesDir);

  console.log("Creating video...");
  await runFfmpeg(ffmpegPath, imagePaths, outputPath);

  console.log("Video created successfully");
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});