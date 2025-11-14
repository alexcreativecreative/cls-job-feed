const fs = require("fs");
const https = require("https");
const { parseStringPromise } = require("xml2js");

const FEED_URL = "https://conceptlifesciences.peoplehr.net/Pages/JobBoard/CurrentOpenings.aspx?o=dfed9099-5acb-4756-bf3e-41a426270f97";

console.log("✅ Running build-jobs.js");

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function generateJobCard(job) {
  const title = job.title?.[0] || "";
  const location = job.location?.[0] || "";
  const department = job.department?.[0] || "";
  const salary = job.salaryrange?.[0] || "";
  const closing = job.closingdate?.[0] || "";
  const link = job.link?.[0] || "#";

  return `
  <div class="job-card">
    <div class="job-title">${title}</div>

    <div class="job-info-row">
      <div class="job-pill">${department}</div>
      <div class="job-pill">${location}</div>
    </div>

    <div class="job-info-row">
      <div class="job-icon-text">
        <img src="https://uploads-ssl.webflow.com/your-salary-icon.svg" class="job-icon" />
        <span>${salary}</span>
      </div>
      <div class="job-icon-text">
        <img src="https://uploads-ssl.webflow.com/your-calendar-icon.svg" class="job-icon" />
        <span>Closing date: ${closing}</span>
      </div>
    </div>

    <a href="${link}" class="job-cta-button">View role</a>
  </div>
  `;
}

function generateHTML(jobCards) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CLS Jobs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <div id="job-feed">
    ${jobCards.join("\n")}
  </div>
</body>
</html>`;
}

(async () => {
  try {
    const xml = await fetchRSS(FEED_URL);
    const parsed = await parseStringPromise(xml);
    const jobs = parsed.rss?.channel?.[0]?.item || [];

    const jobCards = jobs.map(generateJobCard);
    const html = generateHTML(jobCards);

    fs.writeFileSync("jobs.html", html);
    console.log("✅ jobs.html written successfully");
  } catch (err) {
    console.error("❌ Error generating job feed:", err);
    process.exit(1);
  }
})();
