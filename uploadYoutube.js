const fs = require("fs-extra");
const path = require("path");
const { google } = require("googleapis");

const dbPath = path.join(__dirname, "db.json");

async function uploadYoutube(videoPath) {

    const db = await fs.readJson(dbPath);

    const credentials = await fs.readJson("client_secret.json");
    const token = await fs.readJson("token.json");

    const { client_secret, client_id, redirect_uris } =
        credentials.installed || credentials.web;

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    oauth2Client.setCredentials(token);

    const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client
    });

    console.log("Uploading to YouTube...");

    const response = await youtube.videos.insert({

        part: ["snippet", "status"],

        requestBody: {

            snippet: {

                title: `AI Short ${Date.now()}`,

                description: "Uploaded automatically using Node.js",

                tags: [
                    "shorts",
                    "ai",
                    "automation"
                ],

                categoryId: "22"
            },

            status: {

                privacyStatus: "public",
                selfDeclaredMadeForKids: false

            }

        },

        media: {

            body: fs.createReadStream(videoPath)

        }

    });

    console.log("Upload Success");
    console.log("Video ID :", response.data.id);

    return response.data.id;

}

module.exports = uploadYoutube;