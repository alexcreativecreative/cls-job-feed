const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

const FEED_URL = 'https://conceptlifesciences.peoplehr.net/Pages/JobBoard/CurrentOpenings.aspx?o=dfed9099-5acb-4756-bf3e-41a426270f97';

(async () => {
  console.log("✅ Fetching RSS feed...");

  let feed;
  try {
    feed = await parser.parseURL(FEED_URL);
  } catch (err) {
    console.error("❌ Failed to fetch RSS feed:", err);
    process.exit(1);
  }

  const jobCards = feed.items.map(item => {
    const title = item.title || "Untitled role";
    const link = item.link || "#";
    const summary = item.contentSnippet || "";
    const location = item.categories?.[0] || "Location unknown";
    const department = item.categories?.[1] || "Department unknown";

    return `
      <div class="career27_item">
        <div class="job-card-header-row">
          <div class="job-card-title-col"><div>${title}</div></div>
          <div class="job-card-department-col"><div>${department}</div></div>
        </div>
        <div class="job-description"><p>${summary}</p></div>
        <div class="job-card-info-row">
          <div class="job-info-item">
            <div class="job-info-icon">
              <div class="job-info-icon w-embed">
                <!-- location SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div class="job-info-text"><div>${location}</div></div>
          </div>
        </div>
        <div class="job-card-button-row">
          <a href="${link}" class="job-button w-button" target="_blank">Find out more &amp; apply</a>
        </div>
      </div>
    `;
  }).join('\n');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Jobs Feed</title>
</head>
<body>
  <div id="job-feed">
    ${jobCards}
  </div>
</body>
</html>
`;

  try {
    fs.writeFileSync('jobs.html', htmlContent);
    console.log("✅ jobs.html written successfully");
  } catch (error) {
    console.error("❌ Error writing jobs.html:", error);
    process.exit(1);
  }
})();
