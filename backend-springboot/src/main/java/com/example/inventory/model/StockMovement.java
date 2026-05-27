package com.example.inventory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {
    private String id;
    private String timestamp; // ISO-8601 string or similar
    private String sku;
    private String movementType; // "IN" or "OUT"
    private int quantity;
    private String warehouse;
}
