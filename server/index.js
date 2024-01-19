const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'sitemap.xml');
const dynamicUrls = new Set();

async function updateSitemapFile() {
  try {
    let existingXml = '';

    try {
      existingXml = await fs.readFile(filePath, 'utf-8');
    } catch (readError) {
      // File doesn't exist, ignore read error
    }

    // Remove duplicates from existing XML
    const uniqueExistingUrls = new Set(existingXml.match(/<loc>(.*?)<\/loc>/g) || []);
    existingXml = Array.from(uniqueExistingUrls).join('\n');

    // Add new dynamic URLs to the Set
    const dynamicUrlsArray = Array.from(dynamicUrls).map(url => `<sitemap>\n<loc>${url}</loc>\n</sitemap>`);

    // Combine existing XML with new dynamic URLs
    const combinedXml = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${existingXml.trim()}\n${dynamicUrlsArray.join('\n')}\n</sitemapindex>`;

    // Write combined XML to the file
    await fs.writeFile(filePath, combinedXml, 'utf-8');
    console.log(`XML file '${filePath}' updated successfully.`);

    dynamicUrls.clear();
  } catch (error) {
    console.error('Error:', error);
  }
}

app.get('/read-sitemap', async (req, res) => {
  try {
    const existingXml = await fs.readFile(filePath, 'utf-8');
    console.log(existingXml);
    res.status(200).send(existingXml);
  } catch (error) {
    console.error('Error reading sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-url', async (req, res) => {
  const { url } = req.body;

  if (url) {
    // Check if the URL already exists in the Set or the existing sitemap
    const isDuplicate = dynamicUrls.has(url) || (await isUrlInSitemap(url));

    if (!isDuplicate) {
      dynamicUrls.add(url);
      await updateSitemapFile();
      res.status(200).send('URL added to sitemap successfully.');
    } else {
      res.status(400).send('URL already exists in the sitemap.');
    }
  } else {
    res.status(400).send('Invalid request. Provide a valid URL.');
  }
});

// New function to check if a URL exists in the sitemap
async function isUrlInSitemap(url) {
  try {
    const existingXml = await fs.readFile(filePath, 'utf-8');
    return existingXml.includes(`<loc>${url}</loc>`);
  } catch (error) {
    console.error('Error checking URL in sitemap:', error);
    return false;
  }
}

const port = 3008;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

updateSitemapFile();
