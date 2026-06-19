const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const config = require("./config.json");

async function uploadFacebook(videoPath) {
    try {

        const pageId = config.facebook.pageId;
        const accessToken = config.facebook.accessToken;

        const form = new FormData();

        form.append("source", fs.createReadStream(videoPath));
        form.append("description", path.basename(videoPath));
        form.append("access_token", accessToken);

        const url = `https://graph-video.facebook.com/v23.0/${pageId}/videos`;

        const res = await axios.post(url, form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log("Facebook Upload Success");
        console.log(res.data);

        return res.data;
        
    } catch (err) {

        console.log("Facebook Upload Failed");

        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

        return null;
    }
}

module.exports = uploadFacebook;