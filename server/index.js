const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const app = express();
const port = 3008;
const filePath = path.join(__dirname, 'sitemap.xml');
const dynamicUrls = new Set();

app.use(cors());

async function updateSitemapFile() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Fetch HTML content from your website using Puppeteer
    const websiteUrl = 'http://localhost:3000';
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
    const htmlContent = await page.content();

    // Parse HTML content to extract URLs using Cheerio
    const $ = cheerio.load(htmlContent);
    const extractedUrls = [];

    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        // Prepend the base URL if it's not already there
        const completeUrl = href.startsWith('http') ? href : new URL(href, websiteUrl).toString();
        extractedUrls.push(completeUrl);
      }
    });

    // Remove duplicates from the extracted URLs
    const uniqueExtractedUrls = new Set(extractedUrls);

    // Add only the new extracted URLs to the dynamicUrls Set
    uniqueExtractedUrls.forEach((url) => {
      if (!dynamicUrls.has(url)) {
        dynamicUrls.add(url);
      }
    });

    // Read existing sitemap content
    let existingXml = '';
    try {
      existingXml = await fs.readFile(filePath, 'utf-8');
    } catch (readError) {
      // File doesn't exist, ignore read error
    }

    // Remove duplicates from existing XML
    const uniqueExistingUrls = new Set(existingXml.match(/<loc>(.*?)<\/loc>/g) || []);
    existingXml = Array.from(uniqueExistingUrls).map((url) => `<sitemap>${url}</sitemap>`).join('\n');

    // Add new dynamic URLs to the Set
    const dynamicUrlsArray = Array.from(dynamicUrls).map((url) => `<sitemap>\n<loc>${url}</loc>\n</sitemap>`);

    // Combine existing XML with new dynamic URLs
    const combinedXml = `<sitemapindex xmlns="http://localhost:3008/schemas/sitemap/0.9">\n${existingXml.trim()}\n${dynamicUrlsArray.join('\n')}\n</sitemapindex>`;

    // Write combined XML to the file
    await fs.writeFile(filePath, combinedXml, 'utf-8');
    console.log(`XML file '${filePath}' updated successfully.`);

    // Close Puppeteer browser
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

app.get('/sitemap.xml', async (req, res) => {
  try {
    console.log('Serving sitemap.xml request');
    const existingXml = await fs.readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).end(existingXml);
  } catch (error) {
    console.error('Error reading sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function startServer() {
  try {
    await updateSitemapFile();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

startServer();
