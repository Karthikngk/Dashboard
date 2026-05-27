# Inventory Movement Dashboard

A professional, high-performance web application designed to track, validate, filter, and visualize warehoused stock operations. This platform computes cryptographic digests of stock files, secures the database with SHA verification, and exposes responsive metrics and charts using **React**, **TypeScript**, and **Express**.

---

## 🚀 Key Features

### 1. Cryptographic Upload & Certification Gate (`POST /api/verify-file`)
*   **Frontend SHA computation:** Computes a unique **SHA-256 digest** in the browser utilizing modern, asynchronous, hardware-accelerated **Web Crypto APIs** as soon as a JSON file is picked.
*   **Integrity Assurance:** Submits the file along with the computed signature. The Express backend recomputes the SHA-256 digest over the uploaded raw bytes and matches it case-insensitively. This prevents corrupt files, file truncations, and unauthorized data manipulations.
*   **Simulation Testing:** Users can change the pre-calculated hash in the UI before applying, making it incredibly easy to demonstrate or test validation/integrity failure handling on mismatched digests.

### 2. Multi-Dimensional Filter Deck (`GET /api/movements`)
*   **Required Date Filters:** Limits stock moves inside any selective from/to calendar range.
*   **Transaction Type:** Isolates inventory incoming transactions (`IN`) vs inventory outgoing transactions (`OUT`).
*   **Dynamic Warehouse Selector:** Parses and populates unique warehouse labels (e.g. `WH-NORTH`, `WH-EAST`, `WH-WEST`, `WH-SOUTH`) straight out of the active dataset. If a new schema is uploaded, the selectors automatically rebuild dynamically!

### 3. Analytics Visualizations
*   **Stock Proportion Donut Chart:** A Recharts-powered donut chart visualizing the exact proportions of items coming in vs moving out of warehouses, centered around a gross moved quantity indicator.
*   **Chronological Area Trends:** A beautiful Recharts area-gradient line chart grouped into **daily buckets** (utilizing dates strictly present in current filtered bounds) tracking overall stock flow trends.

### 4. Interactive Operations Audit Log
*   **Stock Ledger Table:** Displays columns of: Operation ID, Calendar Timestamp, SKU (Badge styled), Type (Color-coded indicator), Quantity, and Warehouse.
*   **Optimized Pagination:** Paginated meticulously with 10 records per page, offering responsive backward and forward controls.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend:** React 19, TypeScript, Recharts (Modern chart library), Lucide-React (Beautiful vector icons), Tailwind CSS v4 (Sleek Display typography & layout).
*   **Backend:** Express 4 (Node.js REST API), Multer (Multipart file parsing), Crypto (Native block hashing), Tsx & Esbuild (Fast TypeScript compilation & bundling).

---

## 🚜 Running the Application

### Prerequisites
*   Ensure **Node.js 18+** is installed on your computer.

### Step 1: Install Dependencies
From the repository root, install the required node modules:
```bash
npm install
```

### Step 2: Launch Dev Server (Full-Stack Mode)
Starts the development environment (Express API server + Vite preview client together on **Port 3000**):
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to interact with the application.

### Step 3: Production Build & Compile
Bundles the React client into clean static files (`dist/`) and compiles the Express `server.ts` entry point file to CJS format (`dist/server.cjs` with sourcemaps) using esbuild:
```bash
npm run build
```

### Step 4: Standalone Production Boot
Starts the production server cleanly from compiled binaries:
```bash
npm run start
```

---

## 📝 Trade-offs & Improvements

*   **In-Memory Multer Processing:** Upload buffers are caught in-memory rather than streaming to disk temporarily. This is faster and highly suited for standard payload sizes.
*   **Client-Side Hashing:** Hashing files locally on clients prevents massive file buffers from eating network bandwidth during false submissions, saving server-side CPU overhead.
