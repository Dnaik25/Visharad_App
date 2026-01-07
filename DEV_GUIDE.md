# Development Guide - Visharad App

This guide outlines the steps to set up and run the "Visharad App" locally.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 18 or higher is recommended for Next.js 14+).
- **npm**: Comes bundled with Node.js.

## Installation

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the project directory**:
    ```bash
    cd "path/to/Visharad App"
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
    This will install all necessary packages listed in `package.json`.

## Running the Development Server

To start the application in development mode with hot-reloading:

```bash
npm run dev
```

- The server will usually start at [http://localhost:3000](http://localhost:3000).
- Open this URL in your browser to view the app.
- Changes to source files will automatically reload the page.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

This generates a `.next` folder with the compiled application.

## Running the Production Build

After building, you can start the production server:

```bash
npm run start
```

## Linting

To check for code quality issues:

```bash
npm run lint
```
