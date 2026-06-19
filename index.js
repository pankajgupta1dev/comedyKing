const downloadVideo = require("./downloadVideo");
const getVideoInfo = require("./videoInfo");
const cutVideo = require("./cutVideo");
const uploadYoutube = require("./uploadYoutube");
const uploadFacebook = require("./uploadFacebook");
const uploadInstagram = require("./uploadInstagram");
const uploadCloudinary = require("./uploadCloudinary");
const deleteFile = require("./deleteFiles");

async function start() {
  try {
    await downloadVideo();

    await getVideoInfo();

    const clip = await cutVideo();

    // if (clip) {
    //   console.log("✅ Clip created:");
    //   await uploadYoutube(clip);
    //   await uploadFacebook(clip);
    //   const publicUrl = await uploadCloudinary(clip);
    //   if (!publicUrl) {
    //     throw new Error("Cloudinary upload failed");
    //   }
    //   await uploadInstagram(publicUrl);
    //   await deleteFile(clip);
    // }
  } catch (err) {
    console.log(err);
  }
}

start();
