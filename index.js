const downloadVideo = require("./downloadVideo");
const getVideoInfo = require("./videoInfo");
const cutVideo = require("./cutVideo");
const uploadYoutube = require("./uploadYoutube");
const uploadFacebook = require("./uploadFacebook");
const deleteFile = require("./deleteFiles");
async function start() {

    try {

        await downloadVideo();

        await getVideoInfo();

        const clip = await cutVideo();

        if (clip) {

             await uploadYoutube(clip);
            await uploadFacebook(clip);
 // Upload successful -> delete clip
    await deleteFile(clip);
        }

    } catch (err) {

        console.log(err);

    }

}

start();