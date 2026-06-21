const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const dbPath = path.join(__dirname, "db.json");
const ffprobe = process.platform === "win32" ? path.join(__dirname, "bin", "ffprobe.exe") : "ffprobe";

async function getVideoInfo() {
  const db = await fs.readJson(dbPath);
  const downloadFolder = path.join(__dirname, "downloads");

  await fs.ensureDir(downloadFolder);
  const files = await fs.readdir(downloadFolder);
  const videoFile = files.find((file) => file.endsWith(".mp4") || file.endsWith(".mkv") || file.endsWith(".webm"));

  if (!videoFile) {
    throw new Error("No video found in downloads folder.");
  }

  // Check karo ki kya video file badal gayi hai (Nayi video aayi hai?)
  const isNewVideo = db.downloaded_video !== videoFile;

  db.downloaded_video = videoFile;
  await fs.writeJson(dbPath, db, { spaces: 2 });

  const videoPath = path.join(downloadFolder, videoFile);
  const command = `"${ffprobe}" -v quiet -print_format json -show_format -show_streams "${videoPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return reject(error);
      }

      try {
        const info = JSON.parse(stdout);
        const videoStream = info.streams.find((stream) => stream.codec_type === "video");
        const audioStream = info.streams.find((stream) => stream.codec_type === "audio");

        const result = {
          duration: Math.floor(Number(info.format.duration)),
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: eval(videoStream?.r_frame_rate || "30/1"),
          hasAudio: !!audioStream,
        };

        db.total_duration = result.duration;
        db.video_width = result.width;
        db.video_height = result.height;
        db.video_fps = result.fps;
        db.has_audio = result.hasAudio;

        // 🔥 FIX: Sirf tabhi reset karo jab sach me Nayi Video aayi ho!
        if (isNewVideo) {
          db.last_processed_seconds = 0;
          db.is_completed = false;
          console.log("🆕 New video detected. Resetting progress to 0.");
        }

        await fs.writeJson(dbPath, db, { spaces: 2 });

        console.log("================================");
        console.log("VIDEO INFORMATION");
        console.log("================================");
        console.log("Duration :", result.duration, "sec");
        console.log("Resolution :", result.width + "x" + result.height);
        console.log("FPS :", result.fps);
        console.log("Audio :", result.hasAudio ? "YES" : "NO");
        console.log("================================");

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = getVideoInfo;
