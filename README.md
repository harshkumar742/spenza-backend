# Spenza Webhook Backend

## Tech Stack
- Node.js + Express.js (TypeScript)
- MongoDB
- Kafka
- JWT Authentication

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/your-repo/spenza-backend.git
cd spenza-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run
```bash
npm run dev
```

## API Routes

| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| POST   | /api/auth/register   | Register a new user       |
| POST   | /api/auth/login      | Login and get JWT         |
| POST   | /api/webhook/subscribe | Subscribe to webhook    |
| GET    | /api/webhook/list    | List subscribed webhooks  |
| POST   | /api/webhook/incoming| Handle incoming webhook   |
| GET    | /api/webhook/sent    | List Delivered webhook    |