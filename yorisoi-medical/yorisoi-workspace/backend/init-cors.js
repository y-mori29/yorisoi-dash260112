require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const KEY_FILE_PATH = path.join(__dirname, "sa-key.json");
const storage = new Storage({ keyFilename: KEY_FILE_PATH });
const bucketName = process.env.GCS_BUCKET;

async function setCors() {
    console.log(`Setting CORS for bucket: ${bucketName}...`);
    try {
        await storage.bucket(bucketName).setCorsConfiguration([
            {
                origin: ["http://localhost:3000", "https://yorisoi.medi-canvas.com"],
                method: ["GET", "PUT", "POST", "HEAD", "DELETE", "OPTIONS"],
                responseHeader: ["Content-Type", "x-goog-resumable", "x-goog-meta-*", "Authorization", "Content-MD5"],
                maxAgeSeconds: 3600
            }
        ]);
        console.log("CORS configuration updated successfully.");
    } catch (e) {
        console.error("Failed to set CORS:", e.message);
        console.error("Make sure the service account has 'Storage Admin' role.");
    }
}

setCors();
