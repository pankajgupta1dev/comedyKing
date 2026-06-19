const { v2: cloudinary } = require("cloudinary");
const config = require("./config.json");

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

async function uploadCloudinary(videoPath) {

    try {

        const result = await cloudinary.uploader.upload(videoPath, {
            resource_type: "video",
            folder: "youtube-clips"
        });

        console.log("☁️ Cloudinary Upload Success");
        console.log(result.secure_url);

        return result.secure_url;

    } catch (err) {

        console.log("❌ Cloudinary Upload Failed");
        console.log(err);

        return null;

    }

}

module.exports = uploadCloudinary;