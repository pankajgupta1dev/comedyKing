const fs = require("fs");

function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Deleted:", filePath);
        }
    } catch (err) {
        console.log("Delete Error:", err.message);
    }
}

module.exports = deleteFile;