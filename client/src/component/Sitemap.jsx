import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AutoUpdateSitemap = () => {
  const [sitemapUrls, setSitemapUrls] = useState([]);

  useEffect(() => {
    const fetchAndGenerateSitemap = async () => {
      try {
        const response = await axios.get('http://localhost:3008/sitemap.xml');
        const xmlContent = response.data;
        
        // Parse XML content to extract URLs
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        const locElements = xmlDoc.getElementsByTagName('loc');

        // Extract URLs from the XML content
        const extractedUrls = Array.from(locElements).map((locElement) => locElement.textContent);

        // Now you have the extracted URLs, and you can use them as needed
        console.log('Extracted URLs:', extractedUrls);
        setSitemapUrls(extractedUrls);
      } catch (error) {
        console.error('Error fetching and updating sitemap:', error);
      }
    };

    fetchAndGenerateSitemap();
  }, []);

  // Render the component using sitemapUrls
  return (
    <div>
      <h3>Sitemap URLs:</h3>
      <ul>
        {sitemapUrls.map((url, index) => (
          <li key={index}>{url}</li>
        ))}
      </ul>
    </div>
  );
};

export default AutoUpdateSitemap;
