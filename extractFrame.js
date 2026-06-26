const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs-extra");

const isWin = process.platform === "win32";

if (isWin) {
  const localFfmpeg = path.join(__dirname, "bin", "ffmpeg.exe");
  const localFfprobe = path.join(__dirname, "bin", "ffprobe.exe");

  ffmpeg.setFfmpegPath(localFfmpeg);
  ffmpeg.setFfprobePath(localFfprobe);
}

async function extractFrame(clipPath, partNumber) {
  if (!(await fs.pathExists(clipPath))) {
    throw new Error(`❌ Clip file not found: ${clipPath}`);
  }

  const outputFolder = path.join(__dirname, "output", "thumbnails");
  await fs.ensureDir(outputFolder);

  const imageName = `thumb_part_${String(partNumber).padStart(3, "0")}.jpg`;
  const outputPath = path.join(outputFolder, imageName);

  if (await fs.pathExists(outputPath)) {
    await fs.remove(outputPath);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(clipPath)
      .screenshots({
        timestamps: [15], // 30-sec clip ka middle frame
        filename: imageName,
        folder: outputFolder,
        size: "1080x1920",
      })
      .on("end", async () => {
        try {
          if (!(await fs.pathExists(outputPath))) {
            return reject(new Error("❌ Thumbnail generate hui nahi."));
          }

          console.log(`📸 Image Extracted Successfully: ${imageName}`);
          resolve(outputPath);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg Image Extraction Error:", err.message);
        reject(err);
      });
  });
}

module.exports = extractFrame;
