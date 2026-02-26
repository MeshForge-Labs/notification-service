# Notification Service

Production-ready Node.js Express microservice for AKS: send booking confirmation notifications via email (or mock/log only).

## Stack

- **Node.js 20** (LTS), **Express**
- **Nodemailer** (SMTP or mock)
- **Winston** (structured logging), **express-validator** (request validation)
- **Helmet**, **CORS**

## Project structure

```
notification-service/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── index.js        # Env-based (no hardcoded credentials)
│   ├── controllers/
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── index.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   └── emailService.js  # Mock or Nodemailer SMTP
│   └── utils/
│       └── logger.js
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── secret.example.yaml
├── Dockerfile
├── .dockerignore
└── package.json
```

## Endpoints

| Method | Path                 | Description |
|--------|----------------------|-------------|
| POST   | /api/notifications   | Accept booking data, send email (or mock), log status |
| GET    | /health              | Liveness / readiness |

### POST /api/notifications

**Body:** `{ "userId", "eventId", "bookingId", "quantity" }`

- Validates payload.
- If **mock mode** (MOCK_EMAIL=true or no SMTP): logs notification and returns 202.
- If **SMTP configured**: sends email via Nodemailer (to `userId` as address), logs status, returns 202 on success.

**Response:** `202 Accepted` with `{ message, bookingId, status: "sent"|"logged" }`.

## Configuration (environment variables)

- **MOCK_EMAIL** – `true` to log only (no SMTP). Defaults to mock when SMTP is not set.
- **SMTP_HOST**, **SMTP_USER**, **SMTP_PASS** – required for real email (no hardcoded credentials).
- **SMTP_PORT** (default 587), **SMTP_SECURE** (default false), **SMTP_FROM** (default SMTP_USER).
- **PORT** (default 8083), **NODE_ENV**, **LOG_LEVEL**.

## Build and run

```bash
npm install
# Mock: MOCK_EMAIL=true node src/app.js
# SMTP: set SMTP_HOST, SMTP_USER, SMTP_PASS then node src/app.js
node src/app.js
```

## Docker and Kubernetes

```bash
docker build -t notification-service:1.0.0 .
kubectl apply -f k8s/secret.example.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Liveness and readiness: `/health`.
