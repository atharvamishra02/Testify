# TinyLink - URL Shortener with JWT Authentication

A modern, secure URL shortener built with Next.js, PostgreSQL (Neon), Prisma, and JWT authentication.

## Features

- 🔗 Create short links with custom or auto-generated codes
- 📊 Track click statistics and last clicked timestamps
- 🔐 Secure JWT-based authentication
- 👤 User registration and login
- 🎨 Beautiful glassmorphism UI with Tailwind CSS
- ⚡ Real-time click tracking
- 🗑️ Delete links functionality
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT with jose library
- **Password Hashing**: bcryptjs
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (or any PostgreSQL database)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tinylink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   JWT_SECRET=your-super-secret-jwt-key-change-this
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Step 1: Prepare Your Database

1. Create a PostgreSQL database on [Neon](https://neon.tech) (recommended) or any PostgreSQL provider
2. Copy your database connection string

### Step 2: Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel project settings, add these environment variables:
   
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong random secret (generate one using: `openssl rand -base64 32`)

4. **Deploy**
   
   Click "Deploy" and Vercel will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build your Next.js app
   - Deploy to production

### Step 3: Run Database Migrations (First Deploy)

After first deployment, you may need to run migrations manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

## Project Structure

```
tinylink/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── logout/
│   │   │   │   └── me/
│   │   │   └── links/         # Link management endpoints
│   │   │       ├── [code]/
│   │   │       │   ├── click/ # Click tracking
│   │   │       │   └── route.js
│   │   │       └── route.js
│   │   ├── code/
│   │   │   └── [code]/        # Stats page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── [code]/            # Redirect route
│   │   ├── layout.js
│   │   └── page.js            # Dashboard
│   ├── components/
│   │   ├── CreateLinkForm.js
│   │   └── LinkList.js
│   └── lib/
│       ├── jwt.js             # JWT utilities
│       ├── prisma.js          # Prisma client
│       └── utils.js           # Helper functions
├── .env.example
├── vercel.json
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Links

- `GET /api/links` - Get all links
- `POST /api/links` - Create new link
- `GET /api/links/[code]` - Get link details
- `DELETE /api/links/[code]` - Delete link
- `POST /api/links/[code]/click` - Increment click count

### Redirect

- `GET /[code]` - Redirect to original URL and track click

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |

## Security Features

- ✅ HTTP-only cookies for JWT tokens
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection via Prisma
- ✅ CSRF protection with SameSite cookies
- ✅ Secure cookies in production (HTTPS only)

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Optional user name
- `createdAt`: Account creation timestamp
- `links`: Relation to user's links

### Link Model
- `id`: Unique identifier
- `code`: Short code (unique)
- `originalUrl`: Target URL
- `clicks`: Click count
- `createdAt`: Link creation timestamp
- `lastClickedAt`: Last click timestamp
- `userId`: Owner user ID (optional)
- `user`: Relation to user

## Troubleshooting

### Build Errors on Vercel

If you encounter build errors:

1. Check that all environment variables are set correctly
2. Ensure your database is accessible from Vercel
3. Check Vercel build logs for specific errors

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel IPs
- For Neon, make sure to use the pooled connection string

### Migration Issues

If migrations fail on Vercel:

```bash
# Pull environment variables
vercel env pull

# Run migrations locally
npx prisma migrate deploy

# Or reset and migrate
npx prisma migrate reset
npx prisma migrate deploy
```

## License

MIT

## Author

Built with ❤️ using Next.js and Vercel
