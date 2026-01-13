const fetch = require('node-fetch');

async function check() {
    try {
        const res = await fetch("http://localhost:8080/jobs");
        const json = await res.json();
        console.log("Status:", res.status);
        console.log("Body:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
check();
