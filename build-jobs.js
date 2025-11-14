// === FILE 1: build-jobs.js ===

const fs = require("fs");
const fetch = require("node-fetch");
const { XMLParser } = require("fast-xml-parser");

const FEED_URL = "https://conceptlifesciences.peoplehr.net/Pages/JobBoard/CurrentOpenings.aspx?o=dfed9099-5acb-4756-bf3e-41a426270f97";
const OUTPUT_FILE = "jobs.html";

(async () => {
  try {
    const res = await fetch(FEED_URL);
    const xml = await res.text();
    const parser = new XMLParser();
    const data = parser.parse(xml);

    const items = data.rss.channel.item || [];

    const html = items.map((item) => {
      const title = item.title;
      const dept = item.department;
      const loc = item.location || item.city;
      const closing = item.closingdate?.split(", ")[1] || "TBC";
      const link = item.link;

      return `
        <div class="job-card">
          <div class="job-title">${title}</div>
          <div class="job-pill-row">
            <div class="job-pill">${dept}</div>
            <div class="job-pill">${loc}</div>
          </div>
          <div class="job-info-row">
            <div class="job-info">
              <svg class="job-icon" ...></svg>
              <div class="job-info-label">Closing date</div>
              <div class="job-info-value">${closing}</div>
            </div>
          </div>
          <a class="job-button" href="${link}" target="_blank">View role</a>
        </div>
      `;
    }).join("\n");

    fs.writeFileSync(OUTPUT_FILE, html);
    console.log("✅ jobs.html written with", items.length, "items");
  } catch (err) {
    console.error("❌ Failed to fetch job feed:", err);
  }
})();



// === FILE 2: .github/workflows/generate-jobs.yml ===

name: Generate Jobs Feed

on:
  schedule:
    - cron: "*/30 * * * *"  # every 30 mins
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install node-fetch@2 fast-xml-parser

      - name: Run job feed builder
        run: node build-jobs.js

      - name: Commit and push
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add jobs.html
          git commit -m "Update job feed"
          git push
        continue-on-error: true
