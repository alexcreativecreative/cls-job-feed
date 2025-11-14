// build-jobs.js
const fs = require('fs');
const https = require('https');
const { parseStringPromise } = require('xml2js');

const FEED_URL = 'https://conceptlifesciences.peoplehr.net/Pages/JobBoard/CurrentOpenings.aspx?o=dfed9099-5acb-4756-bf3e-41a426270f97';

console.log('🔄 Fetching job feed...');

https.get(FEED_URL, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    try {
      const result = await parseStringPromise(data);
      const items = result.rss.channel[0].item;

      const jobsHtml = items.map(item => {
        const title = item.title[0];
        const link = item.link[0];
        const description = item.description[0];
        const pubDate = item.pubDate[0];

        return `
        <div class="job-card">
          <div class="job-card_content">
            <div class="job-card_text">
              <h4 class="job-title">${title}</h4>
              <div class="job-info-row">
                <div class="job-info-icon w-embed">📍</div>
                <div class="job-info-text">Location not specified</div>
              </div>
              <div class="job-info-row">
                <div class="job-info-icon w-embed">📅</div>
                <div class="job-info-text">Posted: ${new Date(pubDate).toLocaleDateString()}</div>
              </div>
              <div class="job-info-row">
                <div class="job-info-icon w-embed">🚫</div>
                <div class="job-info-text">Closing date: Not provided</div>
              </div>
              <div class="job-card_link">
                <a class="button-link is-small w-inline-block" href="${link}" target="_blank">
                  <div>View job</div>
                </a>
              </div>
            </div>
          </div>
        </div>`;
      }).join('\n');

      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Jobs Feed</title>
    <style>
      body { font-family: sans-serif; padding: 2rem; }
      .job-card { border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
      .job-title { margin: 0 0 0.5rem; font-size: 1.25rem; }
      .job-info-row { display: flex; gap: 0.5rem; align-items: center; margin: 0.25rem 0; }
      .job-info-icon { width: 1rem; }
      .job-card_link a { text-decoration: none; background: #007bff; color: #fff; padding: 0.5rem 1rem; border-radius: 4px; display: inline-block; }
    </style>
  </head>
  <body>
    ${jobsHtml}
  </body>
</html>`;

      fs.writeFileSync('jobs.html', html);
      console.log('✅ jobs.html written successfully');
    } catch (err) {
      console.error('❌ Failed to parse or write job feed:', err);
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('❌ Error fetching job feed:', err);
  process.exit(1);
});
