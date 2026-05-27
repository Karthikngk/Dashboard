import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Storage paths
  const dataDir = path.join(process.cwd(), 'data');
  const dataPath = path.join(dataDir, 'movements.json');

  // Ensure data folder and movements.json exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Set up multer memory storage for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  // API endpoints
  app.get("/api/movements", (req, res) => {
    try {
      if (!fs.existsSync(dataPath)) {
        return res.json([]);
      }
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const movements = JSON.parse(rawData);

      // Filter query params
      const { from, to, type, warehouse } = req.query;

      let filtered = movements;

      if (from) {
        const fromDate = new Date(from as string);
        filtered = filtered.filter((m: any) => new Date(m.timestamp) >= fromDate);
      }

      if (to) {
        const toDate = new Date(to as string);
        // Include full day of "to"
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((m: any) => new Date(m.timestamp) <= toDate);
      }

      if (type && type !== 'ALL') {
        filtered = filtered.filter((m: any) => m.movementType === type);
      }

      if (warehouse && warehouse !== 'ALL') {
        filtered = filtered.filter((m: any) => m.warehouse === warehouse);
      }

      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verify-file", upload.single("file"), (req, res) => {
    try {
      const file = req.file;
      const clientHash = req.body.sha256;

      if (!file) {
        return res.status(400).json({ error: "No JSON file was uploaded" });
      }

      if (!clientHash) {
        return res.status(400).json({ error: "No SHA-256 hash was provided from frontend" });
      }

      // Recompute SHA-256 hash
      const computedHash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      // Compare hashes case-insensitively
      if (computedHash.toLowerCase() !== clientHash.toLowerCase()) {
        return res.status(400).json({
          error: `SHA-256 validation failed! Expected (Frontend): ${clientHash.toLowerCase()} but Recomputed (Backend) is: ${computedHash}`
        });
      }

      // Parse JSON from upload buffer
      let parsedJson: any;
      try {
        const str = file.buffer.toString("utf-8");
        parsedJson = JSON.parse(str);
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON format in the uploaded file" });
      }

      // Validate schema format - should be an array of objects
      if (!Array.isArray(parsedJson)) {
        return res.status(400).json({
          error: "Uploaded JSON must contain an array of inventory movement objects"
        });
      }

      // Validate array elements
      for (const item of parsedJson) {
        if (!item.id || !item.timestamp || !item.sku || !item.movementType || typeof item.quantity !== "number") {
          return res.status(400).json({
            error: "Uploaded JSON items are missing required fields. Each item must contain id, timestamp, sku, movementType ('IN' or 'OUT'), and quantity"
          });
        }
      }

      // Save valid parsed JSON to our data storage path
      fs.writeFileSync(dataPath, JSON.stringify(parsedJson, null, 2), "utf-8");

      res.json({
        success: true,
        message: "File verified and dataset updated successfully",
        hash: computedHash,
        count: parsedJson.length,
        data: parsedJson
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Hot Module Replacement (HMR) / Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
