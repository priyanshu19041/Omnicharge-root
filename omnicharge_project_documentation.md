# OmniCharge Project Documentation

This document provides a comprehensive overview of the **OmniCharge** project, detailing the architecture, the technology stack, the rationale behind technology choices, and the specific locations where these technologies are implemented.

## 1. Project Overview
**OmniCharge** is a full-stack, distributed web application designed to facilitate mobile recharges. It is built using a **Microservices Architecture** on the backend to ensure scalability, fault isolation, and independent deployment. The frontend is a modern **Single Page Application (SPA)** that consumes these microservices through a unified API Gateway.

---

## 2. Architecture Diagram & Flow

```mermaid
graph TD
    Client[Frontend (Angular)] --> |HTTP Requests| Gateway[API Gateway (Spring Cloud)]
    
    Gateway --> |Route to| UserService[User Service]
    Gateway --> |Route to| OperatorService[Operator Service]
    Gateway --> |Route to| RechargeService[Recharge Service]
    Gateway --> |Route to| PaymentService[Payment Service]
    
    UserService --> |JDBC| UserDB[(PostgreSQL User DB)]
    OperatorService --> |JDBC| OperatorDB[(PostgreSQL Operator DB)]
    RechargeService --> |JDBC| RechargeDB[(PostgreSQL Recharge DB)]
    PaymentService --> |JDBC| PaymentDB[(PostgreSQL Payment DB)]
    
    RechargeService -.-> |Synchronous (OpenFeign)| UserService
    RechargeService -.-> |Synchronous (OpenFeign)| OperatorService
    RechargeService -.-> |Synchronous (OpenFeign)| PaymentService
    
    PaymentService -.-> |Asynchronous Events| RabbitMQ[RabbitMQ Message Broker]
    RabbitMQ -.-> |Consume Events| NotificationService[Notification Service]
    
    subgraph Service Discovery
        Registry[Eureka Service Registry]
    end
    
    UserService -.-> |Register/Discover| Registry
    OperatorService -.-> |Register/Discover| Registry
    RechargeService -.-> |Register/Discover| Registry
    PaymentService -.-> |Register/Discover| Registry
    NotificationService -.-> |Register/Discover| Registry
    Gateway -.-> |Discover Routes| Registry
```

### 2.1 Detailed Request Lifecycle (Frontend to Backend Flow)

To understand how data moves through the system, let's trace a typical user action—for example, **a user initiating a mobile recharge**:

1. **Frontend Interaction (Angular):**
   - The user selects a recharge plan and clicks "Recharge Now" on the Angular SPA.
   - The Angular `HttpClient` constructs an HTTP POST request containing the recharge details (user ID, plan ID, phone number) and attaches the user's JWT (JSON Web Token) in the `Authorization` header.

2. **API Gateway (Spring Cloud Gateway):**
   - The request hits the API Gateway (port `8080`), which acts as the single public entry point for all frontend traffic.
   - **Authentication:** The gateway intercepts the request, extracts the JWT, and validates it. If the token is invalid or missing, it rejects the request with a 401 Unauthorized error.
   - **Routing:** If the token is valid, the gateway looks up its routing rules (dynamically fetched from the Eureka Service Registry) and forwards the request to the appropriate internal microservice—in this case, the `recharge-service`.

3. **Recharge Service (The Orchestrator):**
   - The `recharge-service` receives the request. However, it cannot process the recharge alone. It needs to verify the user, the plan, and process the payment.
   - **Synchronous Call 1 (OpenFeign):** It makes an HTTP call to the `user-service` to verify the user exists and their account is active.
   - **Synchronous Call 2 (OpenFeign):** It calls the `operator-service` to verify the selected plan is valid and fetches its exact price.
   - **Synchronous Call 3 (OpenFeign):** Once verified, it calls the `payment-service` to deduct the amount or register the transaction.

4. **Payment Service (Transaction & Messaging):**
   - The `payment-service` receives the payment request and updates the `payment_db` (PostgreSQL) to securely record the transaction with ACID compliance.
   - **Asynchronous Messaging (RabbitMQ):** Instead of waiting to send an email/SMS directly (which could be slow), the `payment-service` publishes a `PaymentSuccessEvent` message to a RabbitMQ exchange and immediately returns a success HTTP response back to the `recharge-service`.

5. **Completion & Notification:**
   - **Frontend Response:** The `recharge-service` receives the success status from the payment service, updates its own `recharge_db`, and returns a final HTTP 200 OK response back through the API Gateway to the Angular frontend. The UI updates to show a "Recharge Successful" screen to the user.
   - **Background Processing:** Meanwhile, the `notification-service`, which acts as a RabbitMQ consumer, picks up the `PaymentSuccessEvent` from the message queue. It processes this event in the background and sends a simulated SMS or Email to the user confirming the recharge. Because this happens asynchronously, it does not delay the user's experience on the frontend.

---

## 3. Technology Stack Breakdown

### 3.1 Backend: Java & Spring Boot
- **What is it?** A Java-based framework (v3.2.4 with Java 17) used to create stand-alone, production-grade applications easily.
- **Why we used it:** Spring Boot dramatically reduces boilerplate code and configuration. It is the industry standard for building robust microservices due to its vast ecosystem (Spring Cloud, Spring Data, Spring Security).
- **Where we used it:** It is the foundation for all backend microservices (`user-service`, `operator-service`, `recharge-service`, `payment-service`, `notification-service`, `api-gateway`, `service-registry`).

### 3.2 Service Discovery: Spring Cloud Netflix Eureka
- **What is it?** A REST-based service that is primarily used for locating services for the purpose of load balancing and failover of middle-tier servers.
- **Why we used it:** In a microservices architecture, services often change IP addresses or scale up/down. Eureka acts as a phonebook. Instead of hardcoding URLs, services ask Eureka where to find another service.
- **Where we used it:** 
  - **Server:** Running in the `service-registry` module (Port: `8761`).
  - **Clients:** All other microservices have the `@EnableDiscoveryClient` annotation and connect to Eureka.

### 3.3 API Gateway: Spring Cloud Gateway
- **What is it?** A library for building an API Gateway on top of Spring WebFlux. It provides a simple, yet effective way to route to APIs and provide cross-cutting concerns to them such as security, monitoring/metrics, and resiliency.
- **Why we used it:** To provide a single, unified entry point for the frontend. It prevents the frontend from needing to know the exact addresses of every microservice. It handles CORS, routing, and validates JWT tokens centrally before forwarding requests.
- **Where we used it:** The `api-gateway` module (Port: `8080`).

### 3.4 Database: PostgreSQL
- **What is it?** A powerful, open-source object-relational database system known for its reliability and robust feature set.
- **Why we used it:** Mobile recharge involves financial transactions. PostgreSQL provides strong ACID (Atomicity, Consistency, Isolation, Durability) compliance, ensuring that payment and recharge data is never corrupted, even in the event of a crash. 
- **Where we used it:** Implementing the "Database per Service" pattern, we have separate logical databases connected via JDBC:
  - `user_db` for `user-service`
  - `operator_db` for `operator-service`
  - `payment_db` for `payment-service`
  - `recharge_db` for `recharge-service`

> [!NOTE]
> By keeping databases separate, we ensure that if one service's database goes down or needs scaling, it does not directly impact the database operations of other services.

### 3.5 Asynchronous Messaging: RabbitMQ
- **What is it?** A highly reliable and widely used open-source message broker.
- **Why we used it:** To decouple services and handle long-running or non-critical tasks asynchronously. For example, when a payment succeeds, the user should be notified. However, the payment process shouldn't be delayed by the time it takes to send an SMS/Email. RabbitMQ allows the `payment-service` to fire an event and immediately return a success response, while the `notification-service` processes the email in the background.
- **Where we used it:** 
  - **Producer:** `payment-service` uses `RabbitTemplate` to publish messages to queues.
  - **Consumer:** `notification-service` uses `@RabbitListener` to consume messages from the queues.

### 3.6 Synchronous Communication: Spring Cloud OpenFeign
- **What is it?** A declarative web service client that makes writing web service clients easier. 
- **Why we used it:** When a service *must* wait for an immediate response from another service to proceed. For instance, the `recharge-service` cannot process a recharge without verifying the user exists and the plan is valid. OpenFeign allows calling other REST APIs using simple Java interfaces without writing boilerplate HTTP client code.
- **Where we used it:** Inside the `recharge-service` (`UserClient`, `OperatorClient`, `PaymentClient`).

### 3.7 Security & Authentication: JWT (JSON Web Tokens)
- **What is it?** An open standard for securely transmitting information between parties as a JSON object.
- **Why we used it:** To securely authenticate users statelessly. The server does not need to store a session in memory. The token is sent with every request, allowing the microservices to verify the user's identity efficiently.
- **Where we used it:** 
  - Generated in the `user-service` upon login/registration.
  - Validated in the `api-gateway` for incoming requests.

### 3.8 Containerization: Docker & Docker Compose
- **What is it?** Platforms for developing, shipping, and running applications in isolated environments called containers.
- **Why we used it:** To eliminate the "it works on my machine" problem. Docker ensures that every microservice runs in the exact same environment across development, testing, and production. Docker Compose allows us to spin up the entire infrastructure (Databases, RabbitMQ, and all 7 Java services) with a single command.
- **Where we used it:** Root `docker-compose.yml` file and individual `Dockerfile`s within each microservice directory.

### 3.9 Frontend Framework: Angular
- **What is it?** A development platform built on TypeScript for building scalable web applications.
- **Why we used it:** It provides a robust, component-based architecture perfect for enterprise-grade applications. It enforces structure and type safety, making the codebase maintainable as it grows.
- **Where we used it:** The `omnicharge-frontend` directory.

### 3.10 Frontend Language: TypeScript
- **What is it?** A strongly typed programming language that builds on JavaScript.
- **Why we used it:** To catch errors at compile-time rather than run-time. It provides excellent auto-completion, refactoring tools, and self-documenting code, which is crucial when communicating with complex backend APIs.
- **Where we used it:** Throughout all `.ts` files in the `omnicharge-frontend`.

### 3.11 Styling: Vanilla CSS
- **What is it?** Standard Cascading Style Sheets without external libraries like Tailwind or Bootstrap.
- **Why we used it:** To maintain maximum control over the visual identity of the project. It allows for the creation of a highly customized, premium, and modern aesthetic without the overhead or specific design constraints of a utility-first framework.
- **Where we used it:** Component `.css` files and the global `styles.css` in the `omnicharge-frontend`.

---

## 4. Summary of Services

| Service Name | Port | Primary Responsibility | Key Technologies |
| :--- | :--- | :--- | :--- |
| **Service Registry** | `8761` | Keeps track of all running microservices. | Eureka Server |
| **API Gateway** | `8080` | Entry point, routing, JWT validation, CORS. | Spring Cloud Gateway |
| **User Service** | `8081` | User registration, login, profile management. | PostgreSQL, JWT, Spring Security |
| **Operator Service** | `8082` | Manage telecom operators and recharge plans. | PostgreSQL |
| **Payment Service** | `8083` | Process payments, publish payment events. | PostgreSQL, RabbitMQ |
| **Recharge Service** | `8085` | Orchestrate the recharge flow. | PostgreSQL, OpenFeign |
| **Notification Service**| `8084` | Listen to queues and send alerts to users. | RabbitMQ |
| **Frontend** | `4200` | UI for users and admins. | Angular, TypeScript, CSS |

> [!TIP]
> **To start the entire backend stack locally:** Ensure Docker is running, navigate to the root directory, and run `docker-compose up -d --build`. This will spin up PostgreSQL, RabbitMQ, and all Spring Boot services defined in the configuration.
