const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const dbPath = path.join(__dirname, "db.json");
const ffmpeg = path.join(__dirname, "bin", "ffmpeg.exe");

const outputFolder = path.join(__dirname, "output");

async function cutVideo() {

    const db = await fs.readJson(dbPath);

    if (!db.downloaded_video) {
        throw new Error("No downloaded video found.");
    }

    await fs.ensureDir(outputFolder);

    const videoPath = path.join(__dirname, "downloads", db.downloaded_video);

    const start = db.last_processed_seconds;

    if (start >= db.total_duration) {

        db.is_completed = true;

        await fs.writeJson(dbPath, db, { spaces: 2 });

        console.log("✅ Video already completed.");

        return null;
    }

    let duration = db.clip_duration;

    if (start + duration > db.total_duration) {
        duration = db.total_duration - start;
    }

    const clipNumber = Math.floor(start / db.clip_duration) + 1;

    const clipName = `clip_${String(clipNumber).padStart(3, "0")}.mp4`;

    const outputPath = path.join(outputFolder, clipName);

    let command;

    if (db.video_height > db.video_width) {

        // Already Vertical Video

        command = `"${ffmpeg}" -y -ss ${start} -i "${videoPath}" -t ${duration} \
-vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
-c:v libx264 \
-preset medium \
-crf 20 \
-c:a aac \
-b:a 192k \
-movflags +faststart \
"${outputPath}"`;

    } else {

        // Landscape -> Blur Background

        const filter =
            "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,boxblur=25:5,crop=1080:1920[bg];" +
            "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];" +
            "[bg][fg]overlay=(W-w)/2:(H-h)/2";

        command = `"${ffmpeg}" -y -ss ${start} -i "${videoPath}" -t ${duration} \
-filter_complex "${filter}" \
-c:v libx264 \
-preset medium \
-crf 20 \
-c:a aac \
-b:a 192k \
-movflags +faststart \
"${outputPath}"`;

    }

    console.log("================================");
    console.log("Creating Reel...");
    console.log("Start :", start);
    console.log("Duration :", duration);
    console.log("Output :", clipName);
    console.log("================================");

    return new Promise((resolve, reject) => {

        exec(command, async (error, stdout, stderr) => {

            if (error) {

                console.log(stderr);

                return reject(error);

            }

            db.last_processed_seconds = start + duration;

            if (db.last_processed_seconds >= db.total_duration) {

                db.is_completed = true;

            }

            await fs.writeJson(dbPath, db, {
                spaces: 2
            });

            console.log("✅ Reel Created Successfully");
            console.log(outputPath);

            resolve(outputPath);

        });

    });

}

module.exports = cutVideo;