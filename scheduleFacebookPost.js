const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

const configPath = path.join(__dirname, "config.json");

async function scheduleFacebookPost(imagePath, caption = "Check out our latest reel! 🔥") {
  try {
    // ---------------- CONFIG CHECK ----------------

    if (!(await fs.pathExists(configPath))) {
      throw new Error("config.json not found.");
    }

    const config = await fs.readJson(configPath);

    const PAGE_ID = config.facebook.pageId;
    const PAGE_ACCESS_TOKEN = config.facebook.accessToken;

    if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
      throw new Error("Facebook pageId or accessToken missing.");
    }

    // ---------------- IMAGE CHECK ----------------

    if (!(await fs.pathExists(imagePath))) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    // ---------------- RANDOM SCHEDULE ----------------

    const currentUnixTime = Math.floor(Date.now() / 1000);

    // Between 1 Hour and 3 Hours
    const minDelay = 60 * 60;
    const maxDelay = 3 * 60 * 60;

    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    const scheduledTime = currentUnixTime + delay;

    const delayHours = Math.floor(delay / 3600);
    const delayMinutes = Math.floor((delay % 3600) / 60);

    console.log(`⏰ Random Delay Selected: ${delayHours} hour(s) ${delayMinutes} minute(s)`);

    console.log(
      "📅 Facebook Image Scheduled For:",
      new Date(scheduledTime * 1000).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    );

    // ---------------- FORM DATA ----------------

    const form = new FormData();

    form.append("source", fs.createReadStream(imagePath));
    form.append("caption", caption);
    form.append("published", "false");
    form.append("scheduled_publish_time", scheduledTime.toString());
    form.append("access_token", PAGE_ACCESS_TOKEN);

    // ---------------- API CALL ----------------

    const url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;

    const response = await axios.post(url, form, {
      headers: form.getHeaders(),
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("📨 Facebook Response:");
    console.log(response.data);

    if (response.data && response.data.id) {
      console.log("✅ Facebook Image Scheduled Successfully.");
      console.log(`🆔 Post ID: ${response.data.id}`);

      return response.data.id;
    }

    return null;
  } catch (error) {
    if (error.response) {
      console.error("❌ Facebook API Error");
      console.error("Status:", error.response.status);
      console.error(error.response.data);
    } else {
      console.error("❌ Facebook Scheduling Failed:", error.message);
    }

    return null;
  }
}

module.exports = scheduleFacebookPost;
