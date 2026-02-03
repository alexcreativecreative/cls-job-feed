const fs = require('fs');
const https = require('https');
const xml2js = require('xml2js');

// RSS feed URL
const FEED_URL =
  'https://conceptlifesciences.peoplehr.net/Pages/JobBoard/CurrentOpenings.aspx?o=dfed9099-5acb-4756-bf3e-41a426270f97';

// SVGs
const locationSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" fill="currentColor"/></svg>`;

const calendarSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 .89 3 2V20C3 21.11 3.89 22 5 22H19C20.11 22 21 21.11 21 20V6C21 4.89 20.11 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>`;

// Fetch and build logic
https.get(FEED_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error('❌ XML Parse Error:', err);
        return;
      }

      const items = result.rss.channel[0].item || [];

      // ✅ Filter out Talent Pool role
      const filteredItems = items.filter((item) => {
        const title = (item.title?.[0] || '').toLowerCase().trim();
        return title !== 'talent pool';
      });

      // ✅ Build job cards
      const jobCards = filteredItems
        .map((item) => {
          const title = item.title?.[0] || 'No title';
          const link = item.link?.[0] || '#';
          const department = item.department?.[0] || 'Department unknown';
          const location = item.location?.[0] || 'Location unknown';
          const closingDate = item.closingdate?.[0] || 'Closing date unknown';

          return `
  <div class="career27_item">
    <div class="job-card-header-row">
      <div class="job-card-title-col"><div>${title}</div></div>
      <div class="job-card-department-col"><div>${department}</div></div>
    </div>

    <div class="job-card-info-row">
      <div class="job-info-item">
        <div class="job-info-icon">
          <div class="job-info-icon w-embed">
            ${locationSVG}
          </div>
        </div>
        <div class="job-info-text"><div>${location}</div></div>
      </div>

      <div class="job-info-item">
        <div class="job-info-icon">
          <div class="job-info-icon w-embed">
            ${calendarSVG}
          </div>
        </div>
        <div class="job-info-text"><div>Closing date: ${closingDate}</div></div>
      </div>
    </div>

    <div class="job-card-button-row">
      <a href="${link}" class="job-button w-button" target="_blank">
        Find out more &amp; apply
      </a>
    </div>
  </div>`;
        })
        .join('\n');

      // ✅ Correct fallback message (your exact content)
      const noJobsHTML = `
  <div class="career27_item">
    <div class="job-description">
      <p>
        There are no live vacancies currently, please check back soon.
        Alternatively, to be considered for future roles, you can sign up to our
        talent pool
        <a href="https://conceptlifesciences.peoplehr.net/Pages/JobBoard/Opening.aspx?v=1b7a8b18-c5ac-4f1c-b5df-0674c371b76c"
           target="_blank">
          <strong>here</strong>
        </a>.
      </p>
    </div>
  </div>`;

      // ✅ Final HTML output
      const finalHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Jobs Feed</title>
</head>
<body>
  <div id="job-feed">
    ${filteredItems.length > 0 ? jobCards : noJobsHTML}
  </div>
</body>
</html>`;

      fs.writeFileSync('jobs.html', finalHTML);

      console.log(
        "✅ jobs.html written successfully with",
        filteredItems.length,
        "items"
      );
    });
  });
}).on('error', (err) => {
  console.error('❌ HTTP Fetch Error:', err);
});
