
  
#  <img height="27px" src="https://github.com/user-attachments/assets/f96ecc14-bc29-4769-828e-c94cb3c87b9e" /> Faved

A private open-source bookmark manager built to handle large collections and advanced use cases. Optimized for ease-of-use and efficiency.

<div align="center">
  
  🧪 **[Try Live Demo](https://demo.faved.to/?utm_source=github&utm_medium=readme)** | 🌐 **[Visit Website](https://faved.to/?utm_source=github&utm_medium=readme)** | 📖 **[Read the Docs](https://faved.to/docs/getting-started/introduction)**
</div>


<div align="center">
  
  📚 **[Blog](https://faved.to/blog?utm_source=github&utm_medium=readme)** | 𝕏 **[Twitter](https://x.com/FavedTool)** | 💬 **[Discord](https://discord.gg/VZrtc8vWp7)**
</div>

<img width="1660" height="1004" alt="screenshot-list-desktop-mobile-safari" src="https://github.com/user-attachments/assets/24b08a59-61dd-48a4-a954-d58375fb3c57" />

## Features

### 🏷️ Advanced Tagging

* Organize bookmarks with **nested tags** for structured grouping (e.g., place *Go* and *Python* under *Programming Languages → Backend*)
* **Customize tags** with color and description *(icons — coming soon)*
* **Search and filter tags** directly from the sidebar
* Optional **tag rollup** to include items from child tags
* **Pin frequently used tags** for quick access

### 🤖 Smart Bookmark Management

* **Automatic fetching** of titles, descriptions, and preview images
* **Duplicate detection** when adding bookmarks
* **Automated tagging** *(planned)*

### ⚡ Powerful UI Designed for Efficiency

* All major actions — bookmark and tag search, filtering, and editing — in one click away with no need to navigate between screens
* Fully responsive — works perfectly on mobile, tablet, and desktop
* Installable as a **PWA** for an app-like, near-native experience on mobile
* System-synced **Light/Dark mode**
* **Instant search** and flexible **sorting**
* **Bulk actions** (deleting, refetching, tagging)
* Customizable **layouts (card/list/table), fields, and sidebar**

### 🔗 Integrations

* **Lightweight browser bookmarklet** — save securely from any browser without extensions
* **Apple Shortcuts** — integrate into native share sheet on iOS/MacOS/iPadOS
* Browser extensions *(planned)*

### 📥 Import & Migration

* Import from **Chrome, Safari, Firefox, Edge** with the original folder structure preserved thanks to nested tags
* Migrate from **Raindrop.io, Pocket,** and other tools retaining original collections, tags and other data



## Overview video

https://github.com/user-attachments/assets/0ecbf26a-9ed8-49d9-a5ce-33d471c06fdf


## Get started

- [Self-host for free](https://faved.to/docs/getting-started/installation?utm_source=github&utm_medium=readme) with no external dependencies. All data is stored locally.
- [Start in the Cloud](https://faved.cloud/signup?utm_source=github&utm_medium=readme) with zero setup, automatic backups and support. Your data is secured with encryption.

## Documentation

- [Introduction](https://faved.to/docs/getting-started/introduction?utm_source=github&utm_medium=readme)
- [Installation](https://faved.to/docs/getting-started/installation?utm_source=github&utm_medium=readme)
- [Updating](https://faved.to/docs/getting-started/updating?utm_source=github&utm_medium=readme)
- [Installing as a PWA app	](https://faved.to/docs/getting-started/installing-as-a-pwa-app)
- [Using browser bookmarklet](https://faved.to/docs/getting-started/using-browser-bookmarklet?utm_source=github&utm_medium=readme)
- [Saving with Apple shortcut](https://faved.to/docs/getting-started/saving-with-apple-shortcut?utm_source=github&utm_medium=readme)
- [Adding and editing bookmarks](https://faved.to/docs/guides/adding-and-editing-bookmarks?utm_source=github&utm_medium=readme)
- [Importing bookmarks](https://faved.to/docs/guides/importing-bookmarks?utm_source=github&utm_medium=readme)
- [Organizing with tags](https://faved.to/docs/guides/organizing-with-tags?utm_source=github&utm_medium=readme)
- [Finding and viewing bookmarks](https://faved.to/docs/guides/finding-and-viewing-bookmarks?utm_source=github&utm_medium=readme)
- [Bulk actions](https://faved.to/docs/guides/bulk-actions?utm_source=github&utm_medium=readme)
- [Changelog](https://github.com/denho/faved/releases)


## Project Structure

- `/controllers`: Application controllers
- `/frontend`: React frontend source files
- `/framework`: Core framework components
- `/models`: Data models
- `/public`: Web-accessible files
- `/storage`: Database storage
- `/utils`: Utility classes
- `/views`: HTML templates

## License

This project is licensed under the [MIT License](LICENSE).

## Credits

Faved uses only open source packages:

- TypeScript, React, Tailwind, Shadcn UI and Vite for the frontend.
- PHP 8, SQLite and Apache for the backend.
