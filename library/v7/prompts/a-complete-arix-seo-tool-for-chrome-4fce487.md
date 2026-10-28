# A complete ARIX SEO Tool for Chrome

By @arixnetwork · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
Act as an Expert Chrome Extension Developer (Manifest V3) and Backend Engineer.

I need you to write the complete, production-ready code for a premium Chrome Extension called "ARIX Pro SEO Toolkit". 

CRITICAL RULES:
1. NO SCRAPING. Use ONLY official, top-tier SEO APIs.
2. Use Manifest V3, Vanilla JavaScript, HTML, and CSS. No React, no build steps.
3. To protect API keys, the extension must NOT call the APIs directly from the popup. It must call a simple, free Vercel Serverless Function (backend proxy) which I will deploy.

TECH STACK & DATA SOURCES:
1. Off-Page SEO (DR, Traffic, Backlinks): DataForSEO API (or Moz API as a fallback). 
2. Technical SEO / Core Web Vitals: Google PageSpeed Insights API.

FILE STRUCTURE REQUIRED:
Please provide the complete code for:
1. `manifest.json` (Manifest V3, permissions: activeTab, storage).
2. `popup.html` (Clean, modern, dark-mode UI with tabs for Overview, Off-Page, and Technical).
3. `popup.css` (Premium styling, clean typography, loading states).
4. `popup.js` (Main controller. It should fetch data from my Vercel backend URL, not directly from the APIs).
5. `api/index.js` (The Vercel Serverless function. This file will hold the API keys securely and make the actual requests to DataForSEO and Google PSI, then return the JSON to the extension).

SPECIFIC LOGIC REQUIREMENTS:
- BACKEND (api/index.js): 
  - Accept a `domain` and `type` (offpage or technical) query parameter.
  - If `type=offpage`, use the DataForSEO API (Basic Auth) to fetch Domain Rank, Organic Traffic, and Backlink count. (Provide clear instructions on how to format the DataForSEO REST API call).
  - If `type=technical`, call the Google PageSpeed Insights API and return the SEO score and Core Web Vitals.
  - Return clean JSON to the frontend.
- FRONTEND (popup.js):
  - Get the current tab's URL.
  - Show a sleek loading skeleton while waiting for the Vercel backend.
  - Display the data in clean cards (e.g., "Domain Rating: 45", "Est. Traffic: 10k", "Backlinks: 5.2k").
  - Include basic local caching (`chrome.storage.local`) for 24 hours so we don't waste API credits if the user clicks the same site twice.

Please output the code for each file clearly labeled. Ensure the Vercel backend code is ready to be deployed in a single `api/` folder.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
