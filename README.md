## 👨‍💻 My Contributions (Backend & Infrastructure)

I architected and developed the core backend microservices and deployment setup for this application:

* **Transaction Service (`transaction-service`):** Built the Node.js service responsible for handling, processing, and logging cross-border payment transactions (`index.js`, `transaction.log`).
* **Currency Service (`currency-service`):** Developed the backend service managing currency conversion logic and multi-currency exchange handling.
* **Background Worker Service (`worker-service`):** Created an asynchronous Node.js worker to process background payment tasks and log execution states (`worker.log`).
* **API Gateway & Reverse Proxy (`nginx`):** Configured Nginx (`nginx.conf`) to route traffic efficiently across the frontend and backend microservices.
