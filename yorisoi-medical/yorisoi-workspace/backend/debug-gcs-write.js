require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const KEY_FILE_PATH = path.join(__dirname, "sa-key.json");
const storage = new Storage({ keyFilename: KEY_FILE_PATH });
const bucketName = process.env.GCS_BUCKET;

async function checkWrite() {
    console.log(`Checking write access to bucket: ${bucketName}...`);
    try {
        const filename = `debug-write-${Date.now()}.txt`;
        await storage.bucket(bucketName).file(filename).save("test content");
        console.log(`Successfully wrote ${filename} to GCS.`);

        // Cleanup
        await storage.bucket(bucketName).file(filename).delete();
        console.log("Successfully deleted test file.");
    } catch (e) {
        console.error("Write failed:", e.message);
        if (e.code === 403) {
            console.error("Cause: 403 Forbidden. The Service Account in sa-key.json does NOT have permission to write to this bucket.");
        }
    }
}

checkWrite();
