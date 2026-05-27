export interface StockMovement {
  id: string;
  timestamp: string;
  sku: string;
  movementType: "IN" | "OUT";
  quantity: number;
  warehouse: string;
}

export interface Filters {
  from: string;
  to: string;
  type: "ALL" | "IN" | "OUT";
  warehouse: string;
}
