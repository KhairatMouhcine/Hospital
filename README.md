<div align="center">
  <img src="https://img.icons8.com/external-flatart-icons-flat-flatarticons/128/000000/external-hospital-health-care-and-medical-flatart-icons-flat-flatarticons-1.png" alt="Mediconnect Logo" width="120" />
  <h1>🚀 Mediconnect</h1>
  <p>A high-performance Hospital Management System built with Microservices Architecture</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/Version-1.0.0-green.svg" alt="Version" />
    <img src="https://img.shields.io/badge/Java-17-orange.svg" alt="Java" />
    <img src="https://img.shields.io/badge/Framework-Spring%20Boot-brightgreen.svg" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Frontend-Angular-red.svg" alt="Angular" />
  </p>
</div>

---

## 📖 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Author](#author)
- [License](#license)

---

## 🎯 About
**Mediconnect** is a comprehensive, scalable, and secure Hospital Management System designed to modernize healthcare workflows. By leveraging a microservices architecture, it provides a highly decoupled environment where doctors, patients, appointments, and billing are managed by specialized, autonomous services. The system ensures high availability through service discovery and maintains a secure environment with robust RBAC and JWT-based authentication.

---

## ✨ Features
- 🔐 **Unified Authentication** — Centralized Auth service with JWT-based stateless security and Role-Based Access Control (RBAC).
- 🏥 **Doctor Management** — Full CRUD operations for medical staff profiles and specializations.
- 👤 **Patient Records** — Secure management of patient information and medical history.
- 📅 **Appointment Scheduling** — Efficient coordination of consultations between patients and doctors via the Rendezvous service.
- 💳 **Event-Driven Billing** — Automated invoice generation triggered by appointment completion, utilizing Apache Kafka.
- 🛰️ **Service Discovery** — Dynamic service registration and lookup powered by Spring Cloud Eureka.
- 🛡️ **API Gateway** — Unified entry point for all client requests with built-in routing and security filters.
- ⚙️ **Centralized Config** — Externalized configuration management across all environments using Spring Cloud Config.
- 💻 **Modern Dashboard** — A responsive and intuitive user interface built with Angular and Tailwind CSS.

---

## 🛠️ Tech Stack
| Category | Technology | Purpose |
|----------|------------|---------|
| **Backend** | Java / Spring Boot | Core Application Logic |
| **Microservices** | Spring Cloud | Gateway, Eureka, Config, Feign |
| **Security** | Spring Security / JWT | Authentication & RBAC |
| **Database** | H2 / JPA Hibernate | Data Persistence & Mapping |
| **Messaging** | Apache Kafka | Event-Driven Billing Logic |
| **Frontend** | Angular 18 | Client-Side Framework |
| **Styling** | Tailwind CSS | Modern Responsive Design |
| **DevOps** | Docker / Zookeeper | Containerization & Orchestration |

---

## 📦 Installation

### Prerequisites
- Java 17+
- Node.js & npm (for Frontend)
- Docker & Docker Compose (for Kafka)
- Maven

### Step 1: Clone the repository
```bash
git clone https://github.com/KhairatMouhcine/Hospital.git
cd Hospital
```

### Step 2: Infrastructure Setup
Start the messaging infrastructure using Docker:
```bash
docker-compose up -d
```

### Step 3: Run Backend Services
You need to start the infrastructure services first, then the functional services.
1. Start `eureka-server`
2. Start `config-server`
3. Start `api-gateway`
4. Start `auth-service`, `doctor-service`, `patient-service`, `rendezvous-service`, and `facture-service`.

Using the provided scripts:
```bash
./start_all.sh
```

### Step 4: Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Usage
1. **Access Eureka**: Visit `http://localhost:8761` to see the status of all registered microservices.
2. **API Access**: All requests should be routed through the Gateway at `http://localhost:8080`.
3. **Frontend**: Open `http://localhost:4200` to access the Mediconnect Dashboard.
4. **Testing**: Use the provided Postman collections in the root folder to test various RBAC scenarios.

---

## 📁 Project Structure
```text
Hospital/
├── api-gateway/          # Unified entry point & routing
├── auth-service/         # JWT Auth & User management
├── config-server/        # Centralized configuration server
├── doctor-service/       # Doctor profile management
├── eureka-server/        # Service discovery registry
├── facture-service/      # Billing & Invoice management
├── frontend/             # Angular client application
├── patient-service/      # Patient data management
├── rendezvous-service/   # Appointment scheduling logic
├── docker-compose.yml    # Kafka & Infrastructure orchestration
└── *.sh                  # Utility scripts for automation
```

---

## 👨‍💻 Author
<div align="center">
  <div style="display: flex; justify-content: center; align-items: center; gap: 60px;">
    <div>
      <img src="https://avatars.githubusercontent.com/KhairatMouhcine?v=4" width="100px" style="border-radius: 50%;" />
      <h3>KhairatMouhcine</h3>
      <p>
        <a href="https://github.com/KhairatMouhcine">
          <img src="https://img.shields.io/badge/GitHub-KhairatMouhcine-black?style=flat&logo=github" />
        </a>
      </p>
      <p>
        <a href="mailto:khairatmouhcine125@gmail.com">
          <img src="https://img.shields.io/badge/Email-khairatmouhcine125@gmail.com-red?style=flat&logo=gmail" />
        </a>
      </p>
    </div>
    <div>
      <img src="https://avatars.githubusercontent.com/Bassma02?v=4" width="100px" style="border-radius: 50%;" />
      <h3>Bassma</h3>
      <p>
        <a href="https://github.com/Bassma02">
          <img src="https://img.shields.io/badge/GitHub-Bassma02-black?style=flat&logo=github" />
        </a>
      </p>
      <p>
        <a href="mailto:b.chihab2002@gmail.com">
          <img src="https://img.shields.io/badge/Email-b.chihab2002@gmail.com-red?style=flat&logo=gmail" />
        </a>
      </p>
    </div>
  </div>
</div>

---

## 📄 License
This project is licensed under the MIT License.
