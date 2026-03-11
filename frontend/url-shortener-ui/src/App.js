import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

function App() {

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [clicks, setClicks] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved data after refresh
  useEffect(() => {

    const savedUrl = localStorage.getItem("lastShortUrl");
    const savedHistory = JSON.parse(localStorage.getItem("history"));

    if (savedUrl) {

      setShortUrl(savedUrl);

      const code = savedUrl.split("/").pop();

      axios
        .get(`http://localhost:8080/analytics/${code}`)
        .then(res => setClicks(res.data.clicks))
        .catch(() => setClicks(0));
    }

    if (savedHistory) {
      setHistory(savedHistory);
    }

  }, []);

  const shortenUrl = async () => {

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setLoading(true);

    try {

      const response = await axios.post(
        "http://localhost:8080/api/shorten",
        { url: url }
      );

      const short = response.data.shortUrl;

      setShortUrl(short);

      localStorage.setItem("lastShortUrl", short);

      const code = short.split("/").pop();

      const analytics = await axios.get(
        `http://localhost:8080/analytics/${code}`
      );

      setClicks(analytics.data.clicks);

      const updatedHistory = [short, ...history];

      setHistory(updatedHistory);

      localStorage.setItem("history", JSON.stringify(updatedHistory));

    } catch (err) {

      setError("Failed to shorten URL");

    }

    setLoading(false);
  };

  const copyUrl = () => {

    navigator.clipboard.writeText(shortUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (

    <div className="container">

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >

        <h1 className="title">⚡ Smart URL Shortener</h1>

        <p className="subtitle">
          Create and share short URLs instantly
        </p>

        <input
          className="input"
          type="text"
          placeholder="Paste your long URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button
          className="button"
          onClick={shortenUrl}
        >
          {loading ? "Generating..." : "Shorten URL"}
        </button>

        {shortUrl && (

          <div className="result">

            <h3>Your Short URL</h3>

            <div className="result-box">

              <a href={shortUrl} target="_blank" rel="noreferrer">
                {shortUrl}
              </a>

              {clicks !== null && (
                <p className="clicks">Clicks: {clicks}</p>
              )}

              <div className="result-buttons">

                <button
                  className="copy-btn"
                  onClick={copyUrl}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

                <a href={shortUrl} target="_blank" rel="noreferrer">
                  <button className="open-btn">
                    Open
                  </button>
                </a>

              </div>

            </div>

          </div>

        )}

        {history.length > 0 && (

          <div className="history">

            <h3>Recent Links</h3>

            {history.map((link, index) => (

              <div key={index} className="history-item">

                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>

              </div>

            ))}

          </div>

        )}

        <p className="footer">
          Built with React + Spring Boot
        </p>

      </motion.div>

    </div>

  );
}

export default App;