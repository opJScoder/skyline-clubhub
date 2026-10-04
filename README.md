# Skyline ClubHub (PERN)

PostgreSQL + Express + React + Node. Roles: **user**, **treasurer**, and **admin**.

## Project structure

```
skyline-clubhub/
├── README.md
├── client/                       # React frontend (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/           # Checkout, EventReport, layout, and shared UI
│       ├── context/              # AuthContext
│       ├── hooks/                # useForm and useLoad
│       ├── pages/                # Auth, Home, Events, Shop, Finance, and more
│       ├── routes/               # AppRoutes and role-based navigation
│       ├── services/api.js       # API client
│       ├── styles/index.css
│       └── utils/                # formatting and UI helpers
└── server/                       # Express REST API
    ├── package.json
    └── src/
        ├── app.js                # Express middleware and /api routes
        ├── server.js             # server entry point
        ├── config/env.js         # environment variables and defaults
        ├── controllers/          # domain business logic
        ├── db/                   # PostgreSQL pool, schema, and initialization
        ├── middleware/           # authentication and error handling
        ├── routes/               # auth, users, events, shop, finance, and more
        └── utils/helpers.js      # shared server helpers
```

## Setup and run

1. Create a PostgreSQL database named `clubhub`.
2. Create `server/.env` with `DATABASE_URL`, and optionally `PORT`, `JWT_SECRET`, `MEMBERSHIP_FEE`, and `MEMBER_MERCH_DISCOUNT`.
3. Start the API:
   ```sh
   cd server
   npm install
   npm start
   ```
4. In a second terminal, start the frontend:
   ```sh
   cd client
   npm install
   npm run dev
   ```
   The frontend runs at http://localhost:5173 and the API defaults to http://localhost:5000.

The server initializes the database schema and demo data when it starts. The client uses the Vite development proxy for API requests.

Demo logins (password `password123`): admin@skyline.edu · treasurer@skyline.edu · user@skyline.edu

## Roles

- **User**: buy membership (gets code SKY-XXXXXX + QR), tickets (member price only while active), merch (10% off for members), see volunteer tasks assigned to them, submit expense claims.
- **Treasurer**: finance dashboard + ledger + CSV, manual entries, approve/reject/reimburse expenses, manage shop (products, stock, order status), create fundraisers, assign volunteers tasks and track progress, scan tickets/verify members.
- **Admin**: create/edit/delete events, announcements, view reports with attendee lists, manage accounts and roles, see all members/shop orders/finance. Cannot buy tickets, merch or membership.

Money is stored as whole rupees. Payments use a demo checkout; swap in Razorpay inside the relevant buy routes.
