const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const dbPath = path.join(__dirname, "db.json");

// const ytDlp = path.join(__dirname, "bin", "yt-dlp.exe");
const ytdlp =
  process.platform === "win32"
    ? path.join(__dirname, "bin", "yt-dlp.exe")
    : "yt-dlp";
const downloadFolder = path.join(__dirname, "downloads");

async function downloadVideo() {

    const db = await fs.readJson(dbPath);

    if (!db.current_video_url) {
        throw new Error("YouTube URL not found in db.json");
    }

    await fs.ensureDir(downloadFolder);

    // Check if video already downloaded
    if (db.downloaded_video) {

        const existingFile = path.join(downloadFolder, db.downloaded_video);

        if (await fs.pathExists(existingFile)) {

            console.log("✅ Video already downloaded.");
            return existingFile;

        }
    }

    console.log("⬇️ Downloading video...");

    const outputTemplate = path.join(downloadFolder, "video.%(ext)s");

    const command = `"${ytDlp}" -o "${outputTemplate}" "${db.current_video_url}"`;

    return new Promise((resolve, reject) => {

        exec(command, async (error, stdout, stderr) => {

            if (error) {
                console.log(stderr);
                return reject(error);
            }

            const files = await fs.readdir(downloadFolder);

            const videoFile = files.find(file =>
                file.endsWith(".mp4") ||
                file.endsWith(".mkv") ||
                file.endsWith(".webm")
            );

            if (!videoFile) {
                return reject("Downloaded file not found.");
            }

            db.downloaded_video = videoFile;

            await fs.writeJson(dbPath, db, { spaces: 2 });

            console.log("✅ Download completed.");
            console.log("File :", videoFile);

            resolve(path.join(downloadFolder, videoFile));

        });

    });

}

module.exports = downloadVideo;