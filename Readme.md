# NIYAN — Coding Contest Tracker

A lightweight Chrome extension that helps competitive programmers track upcoming coding contests from **LeetCode** and **Codeforces** in one place.

Stay organized, keep an eye on upcoming contests, and plan your competitive programming practice without switching between multiple websites.

## ✨ Features

- **Upcoming Contests:** View upcoming contests from LeetCode and Codeforces.
- **Live Countdown:** Track the time remaining until the next contest.
- **Platform Filters:** Filter contests by platform or view all contests together.
- **Search:** Find contests by name.
- **Offline-Friendly Caching:** Previously fetched contest data is stored locally using Chrome Storage, allowing cached contests to remain available when the network is unavailable.
- **Automatic Refresh:** Fetch the latest contest information when the popup loads.
- **Dark UI:** A clean, dark-themed interface styled with Tailwind CSS.
- **NIYAN Branding:** Custom extension icon and branding.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Popup structure |
| Tailwind CSS v4 | Styling and responsive UI |
| JavaScript | Contest fetching, filtering, caching, and countdowns |
| Chrome Extension API | Manifest V3, local storage, extension integration |
| Codeforces API | Contest information |
| LeetCode community API | Upcoming contest information |

## 📸 Preview

The extension provides a compact dashboard for browsing upcoming contests, searching by contest name, filtering by platform, and checking the next contest countdown.

_Add screenshots of your extension here to showcase the interface._

## 📁 Project Structure

```text
testTracker/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── main.js
│   └── style.css
├── index.html
├── manifest.json
├── package.json
├── popup.html
├── popup.css
├── popup.js
└── vite.config.js
```

### Key Files

- `manifest.json` — Extension configuration, permissions, and icon declarations.
- `popup.html` — Popup interface and UI elements.
- `popup.js` — Fetches contest data, manages cached data, renders contests, and handles search, filters, and countdowns.
- `popup.css` — Compiled Tailwind CSS styles used by the popup.
- `src/style.css` — Tailwind CSS input file.
- `src/main.js` — JavaScript entry file for the project.
- `icons/` — Extension icons in the required sizes.
- `package.json` — Project metadata and dependencies.

## 🚀 Installation

### Option 1: Install locally in Chrome

1. Clone or download this repository.
2. If you downloaded a ZIP, extract it.
3. Open Google Chrome and visit `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the project folder containing `manifest.json`.
7. Pin the extension to your toolbar for convenient access.

### Option 2: Set up development

**Prerequisites**

- Google Chrome or another Chromium-based browser.
- Node.js and npm, if you need to install dependencies or rebuild the CSS.
- Git, if you want to clone the repository.

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd testTracker
```

Install the project dependencies:

```bash
npm install
```

Build and watch the Tailwind CSS file:

```bash
npx @tailwindcss/cli -i ./src/style.css -o ./popup.css --watch
```

Keep the command running while developing. After modifying the popup interface or JavaScript, reload the extension from `chrome://extensions` to apply your changes.

> **Note:** The repository must contain a valid `package.json` with the required Tailwind CSS dependencies for the commands above to work.

## 🔌 Data Sources

### Codeforces

The extension retrieves contest information from the official Codeforces API:

`https://codeforces.com/api/contest.list?gym=false`

It uses contest status and start-time information to identify upcoming contests.

### LeetCode

The extension retrieves upcoming contest information from a community-maintained API:

`https://alfa-leetcode-api.onrender.com/contests/upcoming`

This is an unofficial API and is not operated by LeetCode. Its availability, response format, and rate limits may change.

## 💾 Local Caching and Offline Support

The extension uses `chrome.storage.local` to save previously fetched contest information.

The general workflow is:

1. Load cached contest data.
2. Display available cached contests immediately.
3. Fetch fresh data from the contest APIs.
4. Update the cache when a request succeeds.
5. Retain previously cached data when a provider request fails.

**Offline limitation:** The extension cannot fetch new contest information without an internet connection. It displays previously cached information when available, which may be outdated.

## 🔐 Permissions

The extension may request the following Chrome permissions:

- `storage` — Save cached contest information locally.
- `alarms` — Reserved for scheduled tasks if implemented.
- `notifications` — Reserved for notifications if implemented.

Its host permissions allow requests to the Codeforces API and the LeetCode community API.

Permissions should match the functionality actually implemented in the current version of `manifest.json`.

## 🧪 Troubleshooting

**The extension does not appear in Chrome**

- Visit `chrome://extensions`.
- Check whether the extension is enabled.
- Reload the extension or use **Load unpacked** to select the correct project folder.

**Contest information is missing**

- Check your internet connection.
- Open the extension's developer console and inspect errors.
- Verify that the relevant API is responding.
- Remember that the LeetCode community API may be temporarily unavailable.

**The CSS is not updating**

- Ensure the Tailwind watch command is running.
- Confirm that `popup.html` links to `popup.css`.
- Check that the generated CSS file is being updated.
- Reload the extension after making changes.

**Cached contests are outdated**

- Reconnect to the internet and reopen the popup.
- If the API is unavailable, the extension may continue displaying cached information.

## 🗺️ Future Improvements

Potential enhancements for future versions include:

- Customizable contest reminders and Chrome notifications.
- More contest platforms, such as AtCoder and CodeChef.
- Calendar integration and one-click contest registration.
- Improved contest history and personal statistics.
- User-configurable refresh intervals.
- Automated tests and additional error handling.

These are planned enhancements, not necessarily features of the current version.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the extension locally.
5. Submit a pull request describing your changes.

## 🐛 Bug Reports and Feedback

For queries, feedback, or bug reports, contact:

Aryann  
Email: [arryann023@gmail.com](mailto:arryann023@gmail.com)

## 📄 License

No license has been specified yet. Add a `LICENSE` file before distributing the project if you want to define how others may use, modify, and redistribute it.

---



*Built to help competitive programmers stay consistent, prepared, and ahead of every contest.*