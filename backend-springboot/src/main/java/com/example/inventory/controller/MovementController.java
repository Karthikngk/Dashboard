package com.example.inventory.controller;

import com.example.inventory.model.StockMovement;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Allow frontend local connections
public class MovementController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${inventory.file-storage.dir:data/}")
    private String storageDir;

    @Value("${inventory.file-name:movements.json}")
    private String fileName;

    /**
     * GET /api/movements
     * Filters local JSON stock dataset chronological logs dynamically from requests.
     */
    @GetMapping("/movements")
    public ResponseEntity<?> getMovements(
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "warehouse", required = false) String warehouse) {
        try {
            List<StockMovement> allMovements = loadMovementsFromFile();
            
            // Dynamic Stream Filtering
            List<StockMovement> filtered = allMovements.stream()
                .filter(m -> {
                    if (from == null || from.isEmpty()) return true;
                    // Extract date portion 'YYYY-MM-DD' from iso timestamp string
                    String mDate = m.getTimestamp().split("T")[0];
                    return mDate.compareTo(from) >= 0;
                })
                .filter(m -> {
                    if (to == null || to.isEmpty()) return true;
                    String mDate = m.getTimestamp().split("T")[0];
                    return mDate.compareTo(to) <= 0;
                })
                .filter(m -> {
                    if (type == null || type.isEmpty() || type.equalsIgnoreCase("ALL")) return true;
                    return m.getMovementType().equalsIgnoreCase(type);
                })
                .filter(m -> {
                    if (warehouse == null || warehouse.isEmpty() || warehouse.equalsIgnoreCase("ALL")) return true;
                    return m.getWarehouse().equalsIgnoreCase(warehouse);
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(filtered);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving movements: " + e.getMessage());
        }
    }

    /**
     * POST /api/verify-file
     * Performs cryptographic validation + parsing + persistence of JSON schemas.
     */
    @PostMapping("/verify-file")
    public ResponseEntity<?> verifyAndPersistFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("hash") String clientHash) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file is empty");
        }

        try {
            byte[] fileBytes = file.getBytes();
            
            // 1. Calculate the SHA-256 hash of the uploaded file bytes
            String serverHash = calculateSha256(fileBytes);

            // 2. Validate cryptographic signature alignment
            if (!serverHash.equalsIgnoreCase(clientHash)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Data integrity check failed! Server hash " + serverHash + 
                              " does not match client-provided hash " + clientHash);
            }

            // 3. Confirm target valid schema structure (validates as JSON)
            List<StockMovement> parsedData;
            try {
                parsedData = objectMapper.readValue(fileBytes, new TypeReference<List<StockMovement>>() {});
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid file payload! Not a standard StockMovements JSON array layout.");
            }

            // 4. Overwrite persisting data payload directly
            persistDataToFile(fileBytes);

            return ResponseEntity.ok(parsedData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying or writing inventory data: " + e.getMessage());
        }
    }

    /**
     * GET /api/warehouses
     * Exposes simple utility of unique warehouses logged
     */
    @GetMapping("/warehouses")
    public ResponseEntity<?> getWarehouses() {
        try {
            List<StockMovement> movements = loadMovementsFromFile();
            List<String> warehouses = movements.stream()
                    .map(StockMovement::getWarehouse)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(warehouses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    // Utility Method: SHA-256 calculation
    private String calculateSha256(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data);
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    // Load active JSON dataset
    private List<StockMovement> loadMovementsFromFile() throws IOException {
        Path filePath = Paths.get(storageDir, fileName);
        if (!Files.exists(filePath)) {
            return new ArrayList<>();
        }
        byte[] bytes = Files.readAllBytes(filePath);
        return objectMapper.readValue(bytes, new TypeReference<List<StockMovement>>() {});
    }

    // Overwrite datasets
    private void persistDataToFile(byte[] fileBytes) throws IOException {
        Path directory = Paths.get(storageDir);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }
        Path filePath = Paths.get(storageDir, fileName);
        Files.write(filePath, fileBytes);
    }
}
