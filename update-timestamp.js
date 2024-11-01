const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Create timestamp in desired format
const now = new Date();
const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
});

// Replace the timestamp in the HTML
htmlContent = htmlContent.replace(
    /<span id="file-time">.*?<\/span>/,
    `<span id="file-time">${timestamp}</span>`
);

// Write the updated content back to index.html
fs.writeFileSync(indexPath, htmlContent);

console.log('Timestamp updated to:', timestamp); 