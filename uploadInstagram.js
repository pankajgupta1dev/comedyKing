const axios = require("axios");
const config = require("./config.json");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadInstagram(videoUrl) {

    try {

        const igId = config.instagram.businessId;
        const token = config.facebook.accessToken;

        if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
            throw new Error(`Public URL required: ${videoUrl}`);
        }

        console.log("🎬 Creating Media Container...");

        const create = await axios.post(
            `https://graph.facebook.com/v25.0/${igId}/media`,
            null,
            {
                params: {
                    media_type: "REELS",
                    video_url: videoUrl,
                    caption: "My Auto Uploaded Reel",
                    access_token: token
                }
            }
        );

        const containerId = create.data.id;

        console.log("✅ Container:", containerId);

        let isReady = false;

        for (let i = 1; i <= 30; i++) {

            await delay(5000);

            const statusRes = await axios.get(
                `https://graph.facebook.com/v25.0/${containerId}`,
                {
                    params: {
                        fields: "status_code",
                        access_token: token
                    }
                }
            );

            const status = statusRes.data.status_code;

            console.log(`Attempt ${i}: ${status}`);

            if (status === "FINISHED") {
                isReady = true;
                break;
            }

            if (status === "ERROR") {
                throw new Error("Instagram processing failed.");
            }

        }

        if (!isReady) {
            throw new Error("Processing timeout.");
        }

        console.log("🚀 Publishing Reel...");

        const publish = await axios.post(
            `https://graph.facebook.com/v25.0/${igId}/media_publish`,
            null,
            {
                params: {
                    creation_id: containerId,
                    access_token: token
                }
            }
        );

        console.log("🎉 Instagram Upload Success");
        console.log(publish.data);

        return publish.data;

    } catch (err) {

        console.log("❌ Instagram Upload Failed");

        if (err.response) {
            console.log(JSON.stringify(err.response.data, null, 2));
        } else {
            console.log(err.message);
        }

        return null;

    }

}

module.exports = uploadInstagram;