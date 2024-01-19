import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Home from './component/Home';
import Contact from './component/Contact';
import About from './component/About';
import AutoUpdateSitemap from './component/Sitemap';
import Hello from './component/Hello';
const App = () => {
  return (
    <Router>
      <div>
        <AutoUpdateSitemap />

        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/hello">Hello</Link>
            </li>
          </ul>
        </nav>

        <hr />

        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<Home />} />
          <Route path="/hello" element={<Hello />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
