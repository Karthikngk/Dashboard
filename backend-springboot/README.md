# Inventory Dashboard Backend (Spring Boot)

This is the production-ready Java Spring Boot backend for your **Inventory Movement Dashboard**. It implements high-performance cryptographic SHA-256 integrity verification, JSON content parsing, dynamic range/type/warehouse filtering, and JSON local storage persistence.

## Prerequisites
- **Java SE Development Kit (JDK) 17** or higher
- **Maven 3.8+** installed locally

## Project Structure
```text
backend-springboot/
├── pom.xml                               # Maven build configuration
├── DATA/                                 # Persistent file state storage container
│   └── movements.json                    # Active JSON stock movements database
└── src/
    └── main/
        ├── java/
        │   └── com/example/inventory/
        │       ├── InventoryApplication.java        # Spring Boot main class
        │       ├── model/
        │       │   └── StockMovement.java           # Domain Data Schema
        │       └── controller/
        │           └── MovementController.java      # REST API Resource (CORS support active)
        └── resources/
            └── application.properties    # Server and file-size properties
```

## How to Run Locally

### 1. Build and Package
Navigate to the root of the Spring Boot directory:
```bash
cd backend-springboot
mvn clean package
```

### 2. Run the Application
Start the Spring Boot server using Maven:
```bash
mvn spring-boot:run
```
Once started, the server will list on **`http://localhost:8080`**.

## Supported REST Endpoints

### 1. GET `/api/movements`
Fetch and filter list log dataset records.
- **Parameters**:
  - `from` (*Optional*, format `YYYY-MM-DD`): Filter records on or after this date.
  - `to` (*Optional*, format `YYYY-MM-DD`): Filter records on or before this date.
  - `type` (*Optional*, `IN` | `OUT` | `ALL`): Filter by transaction type.
  - `warehouse` (*Optional*, `ALL` or String): Filter by specific warehouse source.

### 2. POST `/api/verify-file`
Verifies SHA-256 hash checksums of stock movement JSON files, parses content schema, and persists active state logs on match.
- **Payload** (`multipart/form-data`):
  - `file`: The `.json` stock movements file.
  - `hash`: Client side SHA-256 string signature to verify.

### 3. GET `/api/warehouses`
Returns dynamic list of distinct warehouses present in the active dataset.
