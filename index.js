const downloadVideo = require("./downloadVideo");
const getVideoInfo = require("./videoInfo");
const cutVideo = require("./cutVideo");
const extractFrame = require("./extractFrame");
const scheduleFacebookPost = require("./scheduleFacebookPost");
const uploadYoutube = require("./uploadYoutube");
const uploadFacebook = require("./uploadFacebook");
const uploadInstagram = require("./uploadInstagram");
const uploadCloudinary = require("./uploadCloudinary");
const deleteFile = require("./deleteFiles");
const fs = require("fs-extra");
const path = require("path");

async function start() {
  try {
    console.log("🚀 Starting Pipeline...\n");

    // Agar downloadVideo() use karna ho to uncomment kar dena
    // await downloadVideo();

    // Video info check
    await getVideoInfo();

    // 30-sec clip create
    const clip = await cutVideo();

    if (!clip) {
      console.log("ℹ️ No clip generated.");
      return;
    }

    // console.log("✅ Clip Created:", clip);

    // ---------------- FACEBOOK IMAGE SCHEDULER ----------------

    try {
      const dbPath = path.join(__dirname, "db.json");

      if (!(await fs.pathExists(dbPath))) {
        throw new Error("db.json not found.");
      }

      const db = await fs.readJson(dbPath);

      const currentPart = Math.floor(db.last_processed_seconds / db.clip_duration);

      console.log(`📸 Extracting thumbnail for Part ${currentPart}...`);

      const extractedImage = await extractFrame(clip, currentPart);

      console.log("🖼️ Thumbnail:", extractedImage);

      if (extractedImage && (await fs.pathExists(extractedImage))) {
        const caption = `Part ${currentPart} of our viral series! 🔥 Full video link in comments. #shorts #viral`;

        const postId = await scheduleFacebookPost(extractedImage, caption);

        if (postId) {
          // console.log("✅ Facebook Image Scheduled Successfully.");
          console.log("🆔 Post ID:", postId);
        } else {
          console.log("⚠️ Facebook scheduling failed.");
        }
      } else {
        console.log("⚠️ Thumbnail generate nahi hui.");
      }
    } catch (schedError) {
      console.error("⚠️ Facebook Scheduler Error:", schedError.message);
    }

    // ---------------- SOCIAL MEDIA UPLOAD ----------------

    console.log("\n🚀 Starting Video Uploads...");

    await uploadYoutube(clip);

    await uploadFacebook(clip);

    const publicUrl = await uploadCloudinary(clip);

    if (!publicUrl) {
      throw new Error("Cloudinary upload failed.");
    }

    console.log("☁️ Cloudinary URL:");
    console.log(publicUrl);

    await uploadInstagram(publicUrl);

    deleteFile(extractedImage);
    deleteFile(clip);

    console.log("\n🎉 Pipeline Completed Successfully.");
  } catch (err) {
    console.error("\n❌ Main Pipeline Error:");
    console.error(err);
  }
}

start();
