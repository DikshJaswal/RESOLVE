https://resolve-pink-eight.vercel.app/

# RESOLVE

RESOLVE is a role-based customer support workspace built with React, TypeScript, Express, and MySQL.

## Features

- Customer, agent, and admin authentication
- Role-based ticket visibility and permissions
- Ticket creation, assignment, status, and priority management
- Conversation replies and ticket activity history
- In-app notifications
- Ticket attachments through Cloudinary
- Admin staff management and dashboard metrics
- MySQL schema initialization and seed data
- Vitest validation tests, Docker, Render, and Vercel deployment configuration

## Roles

- Customers create tickets and see only their own requests.
- Agents see unassigned open tickets and tickets assigned to them. They can claim tickets, reply, and update workflow fields.
- Admins see all tickets and manage staff, assignments, priorities, and statuses.

## Local setup

### Server

```powershell
cd server
npm install
Copy-Item .env.example .env
# Fill in the MySQL and JWT values in .env
npm run db:init
npm run db:migrate:active-users
npm run db:migrate:notifications
npm run db:seed
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### Client

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

The client runs at `http://localhost:5173`.

## Environment variables

Keep `.env` files private. Use `.env.example` as the template. Production must use new random JWT secrets and production database credentials. Cloudinary variables are required only for attachment uploads.

## Testing and builds

```powershell
cd server
npm test
npm run build

cd ..\client
npm run build
```

## Deployment

The repository includes `render.yaml` for the API and `client/vercel.json` for SPA routing. Configure the client `VITE_API_URL` to the deployed API URL and set `CLIENT_URL` on the API to the deployed client URL.
