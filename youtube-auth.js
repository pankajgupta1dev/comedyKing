// const fs = require("fs");
// const { authenticate } = require("@google-cloud/local-auth");
// const { google } = require("googleapis");

// async function authorize() {
//   const auth = await authenticate({
//     keyfilePath: "./client_secret.json",
//     scopes: ["https://www.googleapis.com/auth/youtube.upload"],
//   });

//   fs.writeFileSync(
//     "token.json",
//     JSON.stringify(auth.credentials)
//   );

//   console.log("✅ token.json created");
// }

// authorize();
const fs = require("fs");
const { authenticate } = require("@google-cloud/local-auth");

async function authorize() {
  // Purani file delete hona zaroori hai
  const auth = await authenticate({
    keyfilePath: "./client_secret.json",
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  // Is credentials object me ab bina expiry wala refresh token aayega
  fs.writeFileSync(
    "token.json",
    JSON.stringify(auth.credentials, null, 2)
  );

  console.log("✅ New Permanent token.json created successfully!");
}

authorize();