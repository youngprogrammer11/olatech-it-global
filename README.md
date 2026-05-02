# Olatech IT Global — Corporate Website

A premium, production-ready corporate website for **Olatech IT Global**, built with Node.js/Express backend, MongoDB for contact form storage, and a fully custom HTML/CSS/JS frontend.

---

## 📁 Folder Structure

```
olatech-it-global/
├── public/
│   ├── css/
│   │   └── style.css          # All styles (2000+ lines, responsive)
│   ├── js/
│   │   └── main.js            # Interactions, animations, form logic
│   └── index.html             # Full single-page website
├── models/
│   └── Contact.js             # MongoDB contact submission schema
├── routes/
│   └── contact.js             # POST /api/contact + GET /api/contact
├── server.js                  # Express entry point
├── package.json
├── .env.example               # Environment variable template
└── README.md
```

---

## ✅ Features

- **5-section single page:** Hero, Services, About, Portfolio, Contact
- **Sticky navbar** with scroll-triggered glass effect & active link tracking
- **Hero section** with animated gradient orbs, counter stats, and parallax
- **6 service cards** in a CSS Grid layout with hover effects
- **About section** with mission/vision cards and company values
- **5-step process timeline**
- **Portfolio grid** with category filter (All / Web / Software / Brand / Marketing)
- **Infinite scroll testimonials** carousel (CSS animation, pause on hover)
- **Contact form** with Node.js/Express backend + MongoDB storage
- **Google Maps embed** of Ibadan, Nigeria office location
- **Email notifications** via Nodemailer (optional, configurable)
- **Scroll-reveal animations** using IntersectionObserver
- **Animated counters** (150 projects, 98% satisfaction, 12 countries, 8 years)
- **Fully responsive** — mobile, tablet, desktop
- **Security hardened** with Helmet.js, rate limiting (10 req/15min), input validation

---

## ⚙️ Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **npm** v9+
- **MongoDB** (local or MongoDB Atlas) — https://mongodb.com/atlas

---

## 🚀 Local Setup & Run

### 1. Clone / Extract the project

```bash
cd olatech-it-global
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olatech   # or your Atlas URI
NODE_ENV=development

# Optional: email notifications for contact form
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password              # NOT your login password
EMAIL_TO=info@olatechitglobal.com
```

> **MongoDB Atlas (recommended):**
> 1. Go to https://cloud.mongodb.com → Create free cluster
> 2. Click Connect → Drivers → Copy connection string
> 3. Replace `<password>` in the string and paste as `MONGODB_URI`

> **Gmail App Password:**
> 1. Enable 2FA on your Google account
> 2. Go to https://myaccount.google.com/apppasswords
> 3. Generate password for "Mail" → paste as `EMAIL_PASS`

### 4. Start the server

**Development (auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/contact` | Submit contact form (saved to MongoDB + email) |
| GET | `/api/contact` | List all contact submissions (admin use) |
| GET | `/api/health` | Server health check |

### Example POST `/api/contact`

```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+234 800 000 0000",
  "service": "web-development",
  "message": "We need a new e-commerce platform..."
}
```

---

## 🌐 Deployment

### Option A — Render (Free Tier, Recommended)

1. Push your project to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables (same as `.env`):
   - `MONGODB_URI` → your Atlas URI
   - `NODE_ENV` → `production`
   - Add email vars if needed
6. Click **Deploy** — live in ~2 minutes

### Option B — Vercel

> Note: Vercel is optimised for serverless. For full Express apps with MongoDB, Render is better. But here's the Vercel path:

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

3. Run: `vercel --prod`
4. Add env vars in Vercel Dashboard → Project Settings → Environment Variables

### Option C — VPS (DigitalOcean / AWS EC2)

```bash
# On your server
git clone your-repo
cd olatech-it-global
npm install
cp .env.example .env && nano .env   # fill in values

# Install PM2 for process management
npm install -g pm2
pm2 start server.js --name olatech
pm2 save
pm2 startup

# Install Nginx as reverse proxy
sudo apt install nginx
# Configure /etc/nginx/sites-available/olatech:
# proxy_pass http://localhost:3000;
```

---

## 🔒 Security Features

- **Helmet.js** — HTTP security headers (XSS, CSRF, clickjacking protection)
- **Rate limiting** — 10 contact submissions per IP per 15 minutes
- **Input validation** — server-side validation with descriptive error messages
- **Content-Security-Policy** — restricts external resource loading
- **Body size limits** — max 10kb request body
- **MongoDB sanitisation** — Mongoose schema validation prevents injection

---

## 🎨 Customisation

### Update contact information
Edit `public/index.html` — search for:
- `info@olatechitglobal.com`
- `+234 800 000 0000`
- `14 Adeoye Crescent, Ibadan`

### Change colours
Edit `public/css/style.css` `:root` variables:
```css
:root {
  --navy:   #060e1f;   /* main background */
  --blue:   #1a4fd6;   /* primary brand blue */
  --cyan:   #06b6d4;   /* accent colour */
}
```

### Update Google Map
In `index.html`, replace the `<iframe src="...">` with a new Google Maps embed URL for your exact address.

### Add real portfolio images
Replace `.project-placeholder` divs with `<img>` tags pointing to actual project screenshots.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (custom, no framework), Vanilla JS |
| Backend | Node.js 18+, Express 4 |
| Database | MongoDB + Mongoose |
| Email | Nodemailer |
| Security | Helmet.js, express-rate-limit |
| Fonts | Syne + DM Sans (Google Fonts) |
| Deployment | Render / Vercel / Any Node host |

---

## 📞 Support

**Olatech IT Global**
- Email: info@olatechitglobal.com
- Website: https://olatechitglobal.com
- Location: Ibadan, Oyo State, Nigeria
