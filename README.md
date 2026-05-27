# Inventory Dashboard Application

A full-stack Inventory Movement Dashboard built using React (Frontend) and Spring Boot (Backend).

The application validates uploaded stock movement JSON using SHA hash verification and visualizes inventory movement data with filters, charts, and analytics.

---

# ⚙️ Prerequisites

Install the following software before running the project.

## 1. Node.js

Download and install:

url Node.js[https://nodejs.org](https://nodejs.org)

---

## 2. Java 17

Download and install:

url Eclipse Temurin (Java 17)[https://adoptium.net](https://adoptium.net)

---

## 3. Maven

Download and install:

url Apache Maven[https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)

---

## 4. Git

Download and install:

url Git [https://git-scm.com](https://git-scm.com)

---

# ▶️ Running the Application

## Step 1 — Clone Repository

```bash
git clone https://github.com/Karthikngk/Dashboard.git
```

---

## Step 2 — Open Project

```bash
cd Dashboard
```

---

# 🚀 Start Backend First

⚠️ Always start the backend before starting the frontend.

## Step 3 — Run Spring Boot Backend

Navigate to backend folder:

```bash
cd backend-springboot
```

Run Spring Boot application:

```bash
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Once backend starts successfully, open a NEW terminal.

---

# 💻 Start Frontend Application

## Step 4 — Run React Frontend

Open another NEW terminal.

Go to project root:

```bash
cd Dashboard
```

Install dependencies (first time only):

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 🌐 Application URLs

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend  | [http://localhost:8080](http://localhost:8080) |

---

# 📦 Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Charts & Analytics

## Backend

* Spring Boot
* Java 17
* Maven
* REST APIs

---

# 📁 Project Structure

```text
Dashboard/
│
├── backend-springboot/
│   ├── src/
│   └── pom.xml
│
├── src/
├── public/
├── package.json
└── vite.config.js
```

---

# ✅ Features

* Upload Inventory JSON
* SHA Hash Validation
* Inventory Movement Analytics
* Interactive Charts
* Filter by Date
* Filter by Movement Type
* Responsive Premium UI
* Real-time Dashboard Experience

---

# 🛠 Troubleshooting

## Frontend not starting?

Run:

```bash
npm install
```

Then:

```bash
npm run dev
```

---

## Backend not starting?

Make sure:

* Java 17 is installed
* Maven is installed
* Port 8080 is free

Check versions:

```bash
java -version
mvn -version
```

---

# 👨‍💻 Author

Developed by Karthik.
