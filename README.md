# MarkBook

![preview](snap.png)

**Read repositories the way they deserve to be read—beautifully, offline, on your terms.**

MarkBook is a specialized reader that instantly converts GitHub markdown repositories into organized, offline-ready electronic books. It is built with a "Local-First" architecture, ensuring your reading data and tokens never leave your device.

## Features

-   **Turn Repos into Books**: Download and parse any public or privately accessible GitHub repository.
-   **Offline First**: Advanced caching strategies (IndexedDB) store chapters, images, and formatting specifically on your device.
-   **Privacy Focused**: No backend database. Your GitHub Personal Access Tokens (PAT) are stored exclusively in `localStorage`.
-   **Custom Reading Experience**:
    -   Multiple Themes: Light, Dark, Sepia, System.
    -   Typography: Custom Serif and Sans-serif fonts with adjustable sizing.
-   **Zen Mode**: Distraction-free, full-screen reading environment.
-   **Smart Table of Contents**: Automatically generated navigation for easy access to chapters.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm (v9 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/nimxch/mdx-book.git
    cd mdx-book
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  **Connect GitHub**:
    *   Click "Generate Token on GitHub" in the login screen (Requesting `repo` and `read:user` scopes).
    *   Paste your Personal Access Token (PAT) into the application.
    *   *Note: Guest mode is also available for public repositories.*

2.  **Download a Book**:
    *   Enter the URL of a GitHub repository (e.g., `owner/repo` or full URL).
    *   Click "Download & Read".

3.  **Read**:
    *   Your book is now available offline in your library.
    *   Use the settings menu to adjust fonts and themes.

## Technologies

-   **Core**: React 19, Vite 7, TypeScript
-   **Styling**: Tailwind CSS, Radix UI
-   **Data Storage**: Dexie.js (IndexedDB wrapper)
-   **Markdown Engine**: `react-markdown`, `remark-gfm`

## Privacy & Security

MarkBook respects your privacy by design:
-   **No Tracking**: We do not use analytics or tracking scripts.
-   **Local Storage**: Tokens and user data are stored locally.
-   **Direct Connection**: Use of GitHub API is direct from your browser; no proxy servers are involved.

## Contact

-   **Email**: nimaic.dev@gmail.com
-   **Social**: [X (@nimxch)](https://x.com/nimxch)
-   **Project Issues**: [GitHub Issues](https://github.com/nimxch/mdx-book/issues)

---

**MarkBook** — Read better. Read anywhere. Read yours.
