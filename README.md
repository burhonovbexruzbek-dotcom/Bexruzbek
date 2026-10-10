# DachaStay

Premium Uzbek dacha booking frontend and Express/MongoDB API. The responsive frontend uses React, Vite, TypeScript, Tailwind CSS, React Router and Lucide. The home page, filters, property details, local demo booking flow, registration/login, favorites, and light/dark themes work without a database. Local demo state is not production account or reservation data.

## Run the frontend

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```powershell
npm install
npm run dev
```

Open the Vite URL in the terminal (normally `http://localhost:5173`). Verify with `npm run build`; `npm run lint` runs Oxlint.

The app defaults to self-contained browser demo data. To connect it to the API, copy `.env.example` to `.env.local` in the project root and set `VITE_API_URL=http://localhost:4000/api`, then restart Vite. In API mode, property listings, registration/login, and reservation requests use the server; administrator API routes are available but the in-app dashboard remains a demo view until its admin workflows are connected.

## Run the API

Reservation confirmation uses MongoDB transactions. Use MongoDB Atlas configured as a replica set, or a local MongoDB replica set; a standalone MongoDB server is not sufficient.

In one terminal, start a local replica-set instance (after creating `C:\data\dachastay-db`):

```powershell
mongod --replSet rs0 --dbpath C:\data\dachastay-db --port 27017
```

In a second terminal, initialize it once:

```powershell
mongosh --port 27017 --eval "rs.initiate()"
```

Then configure and start the API in another terminal:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI=mongodb://127.0.0.1:27017/dachastay?replicaSet=rs0`, replace `JWT_SECRET` with a random value of at least 32 characters, and keep `CLIENT_ORIGIN=http://localhost:5173`. Then:

```powershell
npm run seed
npm run dev
```

The API listens at `http://localhost:4000`; check `GET /api/health`. Run backend tests with `npm test` from `server/`.

### First administrator

Register an account through `POST /api/auth/register`, then promote that account once from `mongosh` using its email:

```javascript
db.users.updateOne({ email: "admin@example.uz" }, { $set: { role: "admin" } })
```

Public registration always assigns the `user` role. Do not expose the admin promotion operation through the public API.

### API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/dachas`, `GET /api/dachas/:id`
- `POST /api/bookings`, `GET /api/bookings/mine`
- `GET /api/bookings/admin`, `PATCH /api/bookings/:id/status`
- Admin-only properties: `POST /api/dachas`, `PATCH /api/dachas/:id`, `DELETE /api/dachas/:id`

Send access tokens using `Authorization: Bearer <token>`. Reservation requests start as pending. Admin confirmation rechecks overlapping confirmed bookings inside a transaction; cancelled bookings do not block dates, and same-day checkout/check-in is allowed.

## Integration status

The server API is implemented and documented, but the frontend currently uses clearly labeled browser-local demo state rather than calling the API. The API requires the MongoDB URI and JWT secret above before it can run against real data. Photo management currently accepts image URLs; choosing a hosted upload provider remains a deployment decision. Never treat local browser state as authoritative for real reservations or access control.
