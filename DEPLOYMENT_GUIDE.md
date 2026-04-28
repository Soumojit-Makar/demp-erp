# Digital ERP Demo — Complete Setup & Deployment Guide

## Project Structure

```
digital-erp/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── userController.js        # User CRUD (admin only)
│   │   ├── employeeController.js    # Employee CRUD
│   │   ├── productController.js     # Product CRUD
│   │   ├── salesController.js       # Sales CRUD
│   │   ├── dashboardController.js   # Dashboard stats
│   │   └── reportController.js      # Reports
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect + role authorize
│   │   └── errorHandler.js         # Central error handler
│   ├── models/
│   │   ├── User.js                  # User model (bcrypt password)
│   │   ├── Employee.js              # Employee model
│   │   ├── Product.js               # Product model
│   │   └── Sale.js                  # Sale model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── productRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── server.js                    # Express app entry point
│   ├── seed.js                      # Database seed script
│   ├── vercel.json                  # Vercel serverless config
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── index.js             # Axios API service
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   ├── Table.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── StatCard.jsx
    │   │   │   └── ConfirmDialog.jsx
    │   │   └── layout/
    │   │       ├── Layout.jsx
    │   │       ├── Sidebar.jsx
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state + JWT
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── dashboard/
    │   │   │   └── Dashboard.jsx
    │   │   ├── employees/
    │   │   │   ├── Employees.jsx
    │   │   │   └── EmployeeForm.jsx
    │   │   ├── inventory/
    │   │   │   ├── Products.jsx
    │   │   │   └── ProductForm.jsx
    │   │   ├── sales/
    │   │   │   ├── Sales.jsx
    │   │   │   └── SaleForm.jsx
    │   │   ├── reports/
    │   │   │   └── Reports.jsx
    │   │   ├── profile/
    │   │   │   └── Profile.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx                  # React Router setup
    │   ├── main.jsx                 # App entry point
    │   └── index.css                # Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json                  # SPA rewrite rules
    ├── package.json
    └── .env.example
```

---

## Demo Credentials

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@demoerp.com        | Admin@123    |
| Manager  | manager@demoerp.com      | Manager@123  |
| Employee | employee@demoerp.com     | Employee@123 |

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://mongodb.com/atlas and create a free account
2. Create a new **free tier (M0)** cluster
3. Under **Database Access** → Add a database user:
   - Username: `erp_user`
   - Password: (generate strong password, save it)
   - Role: `Atlas admin`
4. Under **Network Access** → Add IP Address:
   - Click **Allow Access from Anywhere** → `0.0.0.0/0`
   - *(Required for Vercel serverless IPs)*
5. Under **Clusters** → Click **Connect** → **Drivers**:
   - Copy the connection string, it looks like:
     `mongodb+srv://erp_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add the database name before `?`: `.../digital-erp?retryWrites=true...`

---

## Step 2 — Run Locally

### Backend

```bash
cd digital-erp/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and fill in your real values:
#   MONGO_URI=<your Atlas connection string>
#   JWT_SECRET=any_long_random_string_here
#   CLIENT_URL=http://localhost:5173
#   NODE_ENV=development

# Seed database with demo data
npm run seed

# Start dev server (port 5000)
npm run dev
```

### Frontend

```bash
cd digital-erp/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:5000/api

# Start dev server (port 5173)
npm run dev
```

Open http://localhost:5173 and log in with admin@demoerp.com / Admin@123

---

## Step 3 — Deploy Backend to Vercel

1. Push your backend folder to a GitHub repo (or use the monorepo)

2. Go to https://vercel.com → New Project → Import your repo

3. If it's a monorepo, set **Root Directory** to `backend`

4. **Framework Preset**: Other (or Node.js)

5. Under **Environment Variables**, add:

   | Key         | Value                                      |
   |-------------|---------------------------------------------|
   | MONGO_URI   | mongodb+srv://erp_user:...@cluster0...      |
   | JWT_SECRET  | your_super_secret_production_jwt_key        |
   | CLIENT_URL  | https://your-frontend.vercel.app            |
   | NODE_ENV    | production                                  |

6. Click **Deploy**

7. Copy the deployed URL, e.g. `https://digital-erp-api.vercel.app`

8. **(Important)** After deploy, run the seed via a one-time local call:
   - Set `MONGO_URI` in your local `.env` to the Atlas URI
   - Run `npm run seed` locally — it seeds the same Atlas DB

---

## Step 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project → Import frontend repo

2. If monorepo, set **Root Directory** to `frontend`

3. **Framework Preset**: Vite

4. **Build Command**: `npm run build`

5. **Output Directory**: `dist`

6. Under **Environment Variables**, add:

   | Key           | Value                                      |
   |---------------|---------------------------------------------|
   | VITE_API_URL  | https://digital-erp-api.vercel.app/api      |

   *(Use your actual backend Vercel URL from Step 3)*

7. Click **Deploy**

8. Go back to backend Vercel project → Settings → Environment Variables:
   - Update `CLIENT_URL` to the frontend's deployed URL
   - Click **Redeploy** for the change to take effect

---

## Step 5 — Connect Frontend ↔ Backend

The connection happens through one environment variable:

- Frontend sends all API requests to `VITE_API_URL`
- Backend allows CORS from `CLIENT_URL`

Make sure:
- `VITE_API_URL` in frontend = `https://<backend-url>/api`
- `CLIENT_URL` in backend = `https://<frontend-url>`

After changing env vars on Vercel, always **Redeploy** both services.

---

## API Endpoints Reference

### Auth
| Method | Endpoint                  | Access   |
|--------|---------------------------|----------|
| POST   | /api/auth/register        | Public   |
| POST   | /api/auth/login           | Public   |
| GET    | /api/auth/me              | Private  |
| PUT    | /api/auth/profile         | Private  |
| PUT    | /api/auth/change-password | Private  |

### Employees
| Method | Endpoint              | Access          |
|--------|-----------------------|-----------------|
| GET    | /api/employees        | Admin, Manager  |
| GET    | /api/employees/:id    | Admin, Manager  |
| POST   | /api/employees        | Admin, Manager  |
| PUT    | /api/employees/:id    | Admin, Manager  |
| DELETE | /api/employees/:id    | Admin only      |

### Products
| Method | Endpoint             | Access          |
|--------|----------------------|-----------------|
| GET    | /api/products        | All roles       |
| GET    | /api/products/:id    | All roles       |
| POST   | /api/products        | Admin, Manager  |
| PUT    | /api/products/:id    | Admin, Manager  |
| DELETE | /api/products/:id    | Admin only      |

### Sales
| Method | Endpoint          | Access          |
|--------|-------------------|-----------------|
| GET    | /api/sales        | All roles       |
| GET    | /api/sales/:id    | All roles       |
| POST   | /api/sales        | Admin, Manager  |
| PUT    | /api/sales/:id    | Admin, Manager  |
| DELETE | /api/sales/:id    | Admin only      |

### Reports
| Method | Endpoint                  | Access         |
|--------|---------------------------|----------------|
| GET    | /api/reports/sales        | Admin, Manager |
| GET    | /api/reports/inventory    | Admin, Manager |
| GET    | /api/reports/employees    | Admin, Manager |

### Dashboard
| Method | Endpoint       | Access  |
|--------|----------------|---------|
| GET    | /api/dashboard | Private |

---

## Role Permissions Summary

| Feature             | Admin | Manager | Employee |
|---------------------|-------|---------|----------|
| Dashboard           | ✅    | ✅      | ✅        |
| View Inventory      | ✅    | ✅      | ✅        |
| Manage Inventory    | ✅    | ✅      | ❌        |
| Delete Inventory    | ✅    | ❌      | ❌        |
| View/Manage HR      | ✅    | ✅      | ❌        |
| Delete Employees    | ✅    | ❌      | ❌        |
| View/Create Sales   | ✅    | ✅      | ❌        |
| Delete Sales        | ✅    | ❌      | ❌        |
| Reports             | ✅    | ✅      | ❌        |
| User Management     | ✅    | ❌      | ❌        |

---

## Troubleshooting

**CORS errors on Vercel:**
- Make sure `CLIENT_URL` in backend exactly matches your frontend URL (no trailing slash)
- Redeploy backend after changing env vars

**MongoDB connection fails:**
- Check Atlas Network Access allows `0.0.0.0/0`
- Verify the `MONGO_URI` has the correct password and database name

**Blank page after deploy:**
- Ensure `vercel.json` is in the frontend root with the rewrite rule
- Check `VITE_API_URL` is set correctly in Vercel env vars

**JWT errors:**
- Make sure `JWT_SECRET` is a strong, consistent string across deployments
- Don't change it after deployment (tokens will invalidate)

**Seed script fails:**
- Run seed locally with `MONGO_URI` pointing to Atlas
- The seed clears all existing data before inserting — safe to re-run
