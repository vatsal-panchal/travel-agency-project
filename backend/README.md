# 🌍 Wanderlust Travel Agency - Production REST API Backend

A production-ready, deployment-safe REST API backend for a Travel Agency platform built with **Node.js LTS**, **Express 5**, and **MongoDB / Mongoose**.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v20+ or v24+ (LTS)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 2. Installation
```bash
git clone <repo-url>
cd travel-project
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Generate secure 64-byte hex keys for JWT:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Seed the Database
Seeds the admin account and initial travel packages:
```bash
npm run seed
```

### 5. Start the Application
- **Development** (hot reload):
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```
- **Run Tests**:
  ```bash
  npm test
  ```

---

## ⚙️ Environment Variables Table

| Variable | Type / Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` \| `production` \| `test` | Runtime mode |
| `PORT` | `5000` | Port server listens on (binds `0.0.0.0`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/travel_agency` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | String (min 32 chars) | Secret used to sign 15m access tokens |
| `JWT_REFRESH_SECRET` | String (min 32 chars) | Secret used to sign 7d refresh tokens (must differ from access secret) |
| `ACCESS_TOKEN_EXPIRES` | `15m` | Access token lifespan |
| `REFRESH_TOKEN_EXPIRES_DAYS` | `7` | Refresh token lifespan in days |
| `CLIENT_URL` | `http://localhost:5173` | Comma-separated allowed frontend origins (no trailing slashes) |
| `COOKIE_CROSS_SITE` | `false` (or `true`) | Set `true` if React frontend is hosted on a different domain |
| `ADMIN_NAME` | `Super Admin` | Initial admin account name for seed |
| `ADMIN_EMAIL` | `admin@travel.com` | Initial admin email |
| `ADMIN_PASSWORD` | `Admin@12345` | Initial admin password (min 8 chars, 1 letter, 1 number) |

---

## ☁️ MongoDB Atlas Setup Guide
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. In **Network Access**, click **Add IP Address** -> **Allow Access From Anywhere** (`0.0.0.0/0`) or whitelist your deployment IP.
3. In **Database Access**, create a database user (e.g., `travel_admin`) with password.
   > **Important:** If your password contains special characters (like `@`, `#`, `:`, `/`), URL-encode them (`@` -> `%40`, `#` -> `%23`).
4. Click **Connect** -> **Drivers** (Node.js) and copy the connection string into `MONGO_URI` in `.env`.

---

## 🚢 Deployment Guide (Render / Railway)

### 1. Railway
1. Create a new project -> Deploy from GitHub repo.
2. Under **Variables**, add all values from your `.env`.
3. Set `COOKIE_CROSS_SITE=true` if your frontend is on Vercel/Netlify.
4. Set `CLIENT_URL` to your exact frontend domain (e.g. `https://my-travel-app.vercel.app` without trailing slash).
5. Railway automatically runs `npm install` and `npm start`.

### 2. Render
1. Create a **Web Service** pointing to the repository.
2. **Build Command:** `npm ci`
3. **Start Command:** `npm start`
4. Set Environment Variables in Render Dashboard.
5. `app.set('trust proxy', 1)` is already configured in code for Render's reverse proxy.

---

## 💳 Test Credit Cards (Fake Payment Simulation)

| Card Number | Expiry | CVV | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `4242424242424242` | `12/28` | `123` | **SUCCESS** (Booking confirmed, `TXN-...` generated) |
| `4000000000000002` | `12/28` | `123` | **DECLINED** (`PAYMENT_DECLINED`, retry allowed) |
| `4000000000009995` | `12/28` | `123` | **INSUFFICIENT FUNDS** (`INSUFFICIENT_FUNDS`) |
| Any valid Luhn number | Future | `123` | **SUCCESS** |

---

## 🖥️ Frontend Integration Notes (React / Vite)

1. **Credentials & Cookies**:
   - Axios: `axios.defaults.withCredentials = true;`
   - Fetch: `fetch(url, { credentials: 'include' });`
2. **Handling `TOKEN_EXPIRED` (Single-Flight Silent Refresh)**:
   - When an API call returns `401` with `code: "TOKEN_EXPIRED"`, send `POST /api/auth/refresh`.
   - Update your in-memory access token and replay the original failed request.
   - Use an axios response interceptor with a mutex/single-flight queue to prevent 10 simultaneous refresh calls.
3. **Grace Window**:
   - The backend includes a 10-second grace window on refresh tokens so parallel requests do not log users out.

---

## 📡 API Endpoints Summary

### Auth (`/api/auth`)
- `POST /register`: Register user (name, email, password)
- `POST /login`: Login (email, password) -> returns `accessToken`, sets httpOnly refresh cookie
- `POST /refresh`: Rotates refresh token, returns new `accessToken`
- `POST /logout`: Clears cookie & revokes token
- `POST /logout-all`: Revokes all active refresh tokens for the user
- `GET /me`: Returns profile of authenticated user
- `PATCH /profile`: Updates the authenticated user's name and email
- `PATCH /change-password`: Changes password, revokes all sessions

### Packages (`/api/packages`)
- `GET /`: Search & filter packages (`page`, `limit`, `search`, `destination`, `category`, `minPrice`, `maxPrice`, `sort`)
- `GET /:id`: Package details
- `POST /`: (Admin) Create package
- `PATCH /:id`: (Admin) Update package
- `DELETE /:id`: (Admin) Soft delete package

### Bookings (`/api/bookings`)
- `POST /`: Reserve seats atomically (`packageId`, `travelers`, `travelersInfo`)
- `GET /my`: User's bookings
- `GET /:id`: Booking details (owner/admin)
- `PATCH /:id/cancel`: Cancel booking, restore seats, refund payment

### Payments (`/api/payments`)
- `POST /initiate`: Create or reuse pending payment session (`bookingId`)
- `POST /:id/confirm`: Luhn validation & test card processing (idempotent)
- `GET /my`: User's payment history
- `GET /:id`: Payment details

### Admin (`/api/admin`)
- `GET /stats`: Aggregated analytics (users, packages, bookings, 6-month revenue, top packages)
- `GET /users`: Paginated user list & search
- `PATCH /users/:id/block`: Toggle user block status & revoke sessions
- `GET /bookings`: Paginated bookings management
- `GET /payments`: Paginated payment transactions

### Reviews, Wishlist, Enquiries
- `POST /packages/:id/reviews`: Review completed package (aggregates avgRating)
- `GET /packages/:id/reviews`: Paginated reviews for package
- `DELETE /reviews/:id`: Delete review (owner/admin)
- `GET /wishlist`: User wishlist
- `POST /wishlist/:packageId`: Idempotent add to wishlist
- `DELETE /wishlist/:packageId`: Remove from wishlist
- `POST /enquiries`: Submit public enquiry (rate limited: 5/hr)
- `GET /enquiries/my`: User's enquiries
- `GET /enquiries/admin`: Admin enquiry review
- `PATCH /enquiries/admin/:id`: Admin reply to enquiry
