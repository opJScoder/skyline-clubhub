# Skyline ClubHub (PERN)
PostgreSQL + Express + React + Node. Roles: **user**, **treasurer**, **admin**.

## Folder structure
```
skyline-clubhub/
├── server/                     # Express API (layered: route → controller → db)
│   ├── .env.example
│   └── src/
│       ├── config/env.js       # env vars & constants
│       ├── db/                 # pool.js (pg, tx helper), schema.sql, init.js (migrate + seed)
│       ├── middleware/         # auth.js (JWT + role guard), errorHandler.js
│       ├── routes/             # *.routes.js per domain + index.js
│       ├── controllers/        # *.controller.js – business logic per domain
│       ├── utils/helpers.js    # asyncHandler, HttpError, token helpers
│       ├── app.js              # express app (middleware + /api)
│       └── server.js           # entry point
└── client/                     # React (Vite)
    └── src/
        ├── components/         # ui/ (Field, Empty, UIProvider), layout/, Checkout, EventReport
        ├── context/            # AuthContext
        ├── hooks/              # useLoad, useForm
        ├── pages/              # one file per screen
        ├── routes/             # AppRoutes (role-based), navConfig
        ├── services/api.js     # fetch wrapper with JWT
        ├── styles/index.css
        ├── utils/              # format, act, ui (toast/checkout bridge)
        ├── App.jsx
        └── main.jsx
```

## Run
1. `createdb clubhub`
2. `cd server && cp .env.example .env` → edit, then `npm install && npm start` (tables + demo data auto-created)
3. `cd client && cp .env.example .env && npm install && npm run dev` → http://localhost:5173

Demo logins (password `password123`): admin@skyline.edu · treasurer@skyline.edu · user@skyline.edu

## Roles
- **User**: buy membership (gets code SKY-XXXXXX + QR), tickets (member price only while active), merch (10% off for members), see volunteer tasks assigned to them, submit expense claims.
- **Treasurer**: finance dashboard + ledger + CSV, manual entries, approve/reject/reimburse expenses, manage shop (products, stock, order status), create fundraisers, assign volunteers tasks and track progress, scan tickets/verify members.
- **Admin**: create/edit/delete events, announcements, view reports with attendee lists, manage accounts and roles, see all members/shop orders/finance. Cannot buy tickets, merch or membership.

Money is stored as whole rupees. Payments use a demo checkout; swap in Razorpay inside the buy routes.
