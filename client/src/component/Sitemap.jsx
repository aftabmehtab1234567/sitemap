import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AutoUpdateSitemap = () => {
  const location = useLocation();

  useEffect(() => {
    const updateSitemap = async () => {
      const currentUrl = window.location.href;
      try {
        await axios.post('http://localhost:3008/add-url', {
          url: currentUrl,
        });

        console.log('Sitemap updated successfully!');
      } catch (error) {
        console.error('Error updating sitemap:', error.message);
      }
    };

    // Call the updateSitemap function whenever the component mounts or the URL changes
    updateSitemap();
  }, [location.pathname]); // Dependency array includes the pathname

  return (
    <div>
      <p>Automatically updating sitemap...</p>
    </div>
  );
};

export default AutoUpdateSitemap;
