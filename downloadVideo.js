const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const dbPath = path.join(__dirname, "db.json");

// ✅ Variable ka naam yahan lowercase hai
const ytdlp =
  process.platform === "win32"
    ? path.join(__dirname, "bin", "yt-dlp.exe")
    : "yt-dlp";
const downloadFolder = path.join(__dirname, "downloads");

async function downloadVideo() {

    const db = await fs.readJson(dbPath);
if (db.last_video_url !== db.current_video_url) {

    console.log("🆕 New YouTube URL detected. Resetting project...");

    db.last_video_url = db.current_video_url;
    db.downloaded_video = "";
    db.last_processed_seconds = 0;
    db.total_duration = 0;
    db.video_width = 0;
    db.video_height = 0;
    db.video_fps = 0;
    db.has_audio = false;
    db.is_completed = false;

    // Delete old downloaded video
    const files = await fs.readdir(downloadFolder);

    for (const file of files) {
        await fs.remove(path.join(downloadFolder, file));
    }

    await fs.writeJson(dbPath, db, { spaces: 2 });

}
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

    // ✅ Yahan maine ytDlp ko badal kar ytdlp kar diya hai
     const command = `"${ytdlp}" -o "${outputTemplate}" "${db.current_video_url}"`;
    // const command = `"${ytdlp}" --cookies youtube.com_cookies.txt --js-runtimes "node" --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" -o "${outputTemplate}" "${db.current_video_url}"`;

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