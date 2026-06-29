# E-Commerce Backend Blueprint & Flow

This document serves as a comprehensive guide and blueprint for the entire backend architecture, frontend-backend connection flow, and common errors with their fixes for the TSS E-Commerce platform. It can be used as a reference for future similar projects.

## 1. Tech Stack Overview
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript (`tsx` for dev watch, `tsc` for build)
- **Database:** MongoDB Atlas (accessed via Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Storage:** Cloudinary (integrated with Multer)

---

## 2. Backend Architecture & Flow

The backend is modularized within the `src` directory to ensure clean separation of concerns:

### `server.ts` (Entry Point)
- **Initialization:** Sets up the Express app and listens on `PORT 5000`.
- **CORS:** Configures CORS to accept requests from the frontend (`http://localhost:5173` and `FRONTEND_URL`) with `credentials: true` (essential for cookies).
- **Middleware:** Applies `express.json()` and `cookieParser()` globally.
- **Database Connection:** Connects to MongoDB using `mongoose.connect()`.
- **Seeding:** Contains a robust `seedDatabase()` function that populates default products, a default admin (`admin@tss.com`), and a custom admin (`admintss@tss.com`) if the collections are empty.
- **Routes Registration:** Mounts `/api/auth` and `/api/products` routers.

### `models/` (Data Layer)
- **`User.ts`:** Mongoose schema for users. Stores `name`, `email`, `password` (hashed), and `role` (user/admin).
- **`Product.ts`:** Mongoose schema for products. Stores `title`, `price`, `src` (image URL), `badge`, `description`, `category`, `stock` (number), and `specs` (array of key-value pairs).

### `routes/` (Controllers)
- **`auth.ts`:** Handles `/register`, `/login`, `/me`, and `/logout`. 
  - Validates credentials, hashes passwords, and uses a helper `issueTokenAndCookie` to generate a JWT and attach it to an `HttpOnly` cookie.
- **`products.ts`:** Handles CRUD for products.
  - Public routes: `GET /` and `GET /:id`
  - Admin routes: `POST /`, `PUT /:id`, `DELETE /:id`, and `PATCH /:id/stock`.
  - Integrates `upload.single('image')` middleware directly in POST/PUT routes for seamless image uploads. Parses FormData strings (like `specs`) into JSON arrays.

### `middleware/`
- **`auth.ts`:** 
  - `authenticateToken`: Verifies the JWT from the `HttpOnly` cookie and attaches the decoded user payload to `req.user`.
  - `requireAdmin`: Checks if `req.user.role === 'admin'`.
- **`upload.ts`:** Configures `multer` to use `multer-storage-cloudinary`, routing uploaded files directly to Cloudinary and attaching the resulting URL to `req.file.path`.

### `config/`
- **`cloudinary.ts`:** Initializes Cloudinary with `v2.config()` using environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

---

## 3. Frontend to Backend Connection

The connection is managed by a centralized API wrapper in the frontend (`g:\TSS\src\lib\api.ts`).

### Fetch Wrapper (`api.ts`)
- **Base URL:** Defined via `import.meta.env.VITE_API_URL` or defaults to `http://localhost:5000/api`.
- **Credentials:** Every request includes `credentials: 'include'`. This is **crucial** because the backend uses `HttpOnly` cookies for JWT. Without this, the browser will not send the auth cookie.
- **Content-Type Handling:** 
  - Defaults to `application/json` for standard requests.
  - **Magic Trick:** If the payload is `FormData` (e.g., when uploading an image), the wrapper explicitly *deletes* the `Content-Type` header. This forces the browser to automatically set it to `multipart/form-data` along with the required boundary string.

---

## 4. Common Errors Encountered & Their Fixes

### Error 1: CORS Blocked (Cross-Origin Request Blocked)
- **Symptom:** Frontend fetch fails with a CORS error in the browser console.
- **Cause:** Backend did not explicitly allow the frontend's origin or didn't allow credentials.
- **Fix:** In `server.ts`, configure `cors` with `origin: ['http://localhost:5173']` and `credentials: true`.

### Error 2: Authentication State Lost on Page Reload
- **Symptom:** User logs in successfully, but refreshing the page logs them out.
- **Cause:** The JWT cookie wasn't being saved by the browser, or wasn't being sent on subsequent requests.
- **Fix:** 
  1. Backend `sameSite` cookie attribute: Set to `'lax'` for local development (since HTTP/localhost) and `'none'` for production (with `secure: true`).
  2. Frontend: Ensure `credentials: 'include'` is present in the `fetch` config in `api.ts`.

### Error 3: Multer Network Error / "Boundary Not Found"
- **Symptom:** Uploading a product image fails with a 500 server error, Multer complains about missing boundaries.
- **Cause:** The frontend was manually setting `Content-Type: multipart/form-data`.
- **Fix:** Let the browser handle it. In `api.ts`, check `if (body instanceof FormData)` and completely remove the `Content-Type` header from the request options.

### Error 4: "Cannot read property 'path' of undefined" during Image Upload
- **Symptom:** Product creation fails because `req.file` is undefined in the backend router.
- **Cause:** Mismatch between the FormData field name in the frontend and the Multer expected field name in the backend.
- **Fix:** Ensure the frontend appends the file exactly like `formData.append('image', file)`. The string `'image'` must perfectly match the backend middleware: `upload.single('image')`.

### Error 5: FormData Sending Objects as Strings (e.g., `[object Object]`)
- **Symptom:** Product specs save incorrectly into the database when submitting via FormData.
- **Cause:** FormData only accepts strings or Blobs. Passing an array or object directly turns it into `"[object Object]"`.
- **Fix:** 
  1. Frontend: `formData.append('specs', JSON.stringify(specsArray))`.
  2. Backend: In `routes/products.ts`, parse it back: `let parsedSpecs = JSON.parse(req.body.specs);`.

---

## Summary of Best Practices Established
1. **Always use HttpOnly cookies** for JWT to prevent XSS attacks.
2. **Centralize API calls** in the frontend to avoid repeating `credentials` and header logic.
3. **Seed Database on Startup:** It makes development across teams much easier when default data and admin accounts self-populate.
4. **Cloudinary for Storage:** Never store images on the local disk (like a `/public` folder) for a deployed backend, as serverless environments (like Render/Heroku) wipe local disks on restart. Use Cloudinary and `multer-storage-cloudinary`.
