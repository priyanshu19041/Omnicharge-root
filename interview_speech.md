# OmniCharge Project Architecture & Request Flow Interview Speech

## Introduction
"Hello, today I'd like to walk you through the architecture and the complete request lifecycle of my recent project, **OmniCharge**. OmniCharge is a scalable, microservices-based mobile recharge platform. The goal of this project was to build a system that is not only highly available and fault-tolerant but also capable of handling complex distributed transactions and asynchronous processes. 

The tech stack relies on **Angular 17+** on the frontend and **Java Spring Boot** for the backend, supported by **Spring Cloud Gateway**, **Eureka Service Registry**, **PostgreSQL** for persistence, and **RabbitMQ** for asynchronous messaging."

## The Request Flow: From Click to Confirmation
"To best explain how the system works, I'll trace the exact path a 'Message' or 'Request' takes when a user decides to make a mobile recharge. Let's assume the user is logged in and clicks 'Pay Now' on a specific data plan.

### 1. The Frontend (Angular)
It starts at the client layer. Our **Angular** application collects the user's mobile number, selected operator, and the chosen recharge plan ID. The frontend constructs an HTTP POST request containing this payload. We built this UI to be clean, responsive, and completely decoupled from the backend logic, utilizing Angular services to handle the API calls.

### 2. The API Gateway & Service Registry
This HTTP request travels over the internet and hits our single point of entry: the **Spring Cloud API Gateway**. 
- The Gateway's job is routing, cross-origin resource sharing (CORS) handling, and potentially rate-limiting. 
- But how does it know where to send the request? It queries the **Eureka Service Registry**. Every microservice in our ecosystem registers its IP and Port with Eureka upon startup. 
- The Gateway gets the location of the `recharge-service` from Eureka and forwards the HTTP request there.

### 3. Synchronous Validation (OpenFeign)
Now the request lands in the **Recharge Service**. This is the orchestrator for this transaction. Before initiating a payment, it must ensure the data is valid.
- It uses **OpenFeign Clients** to make synchronous internal HTTP calls to other microservices. 
- First, it calls the **User Service** to verify that the requesting user ID is valid and active.
- Second, it calls the **Operator Service** to verify that the specific data plan actually exists and matches the correct price.
If any of these checks fail, the process aborts and an error is sent back to the user.

### 4. Database Persistence (PostgreSQL)
If validations pass, the Recharge Service creates a new `Recharge` record in our **PostgreSQL** database with a status of `PENDING`. We chose PostgreSQL because financial transactions require strict ACID compliance—we cannot risk data corruption or lost records during a recharge.

### 5. Payment Processing (Razorpay & Payment Service)
The Recharge Service then communicates with the **Payment Service**, again via OpenFeign. 
- The Payment Service integrates with the **Razorpay API**. It generates an Order ID and sends it back up the chain to the frontend.
- The user completes the payment on the Razorpay checkout UI.
- Razorpay sends a success callback to our backend. The Payment Service cryptographically verifies the signature to ensure the payment is legitimate.
- It then updates its own database, marking the transaction as `SUCCESS`.

### 6. Asynchronous Messaging (RabbitMQ & Notification Service)
Here is where the architecture shifts from synchronous to asynchronous to improve performance and user experience. 
- Once the payment is verified, the Payment Service doesn't hold up the HTTP thread. Instead, it uses a **RabbitTemplate** to publish a `Payment Successful` event to a **RabbitMQ Exchange**.
- On the other side, the **Notification Service** is passively listening to a RabbitMQ queue bound to that exchange.
- The moment the message arrives, the Notification Service consumes it and fires off an SMS or Email receipt to the user.
- By using RabbitMQ here, if the email server is slow or down, it doesn't cause the payment process to fail or timeout. The message simply waits safely in the queue until the Notification service can process it.

## Conclusion and Architectural Justification
To summarize, the request travels from **Angular -> Gateway -> Recharge Service -> OpenFeign (User/Operator) -> Payment Service -> RabbitMQ -> Notification Service**. 

I chose this specific architecture because it mimics real-world enterprise systems. 
- **Microservices** provide fault isolation; if the Notification service crashes, users can still complete recharges. 
- **Eureka** allows us to horizontally scale instances without hardcoding IPs.
- **RabbitMQ** prevents bottlenecks by decoupling heavy tasks like notifications from the core transaction thread.

Thank you, I'd be happy to dive deeper into any of these specific components or discuss how we handled distributed data management!"
