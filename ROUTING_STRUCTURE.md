# TinyLink Routing Structure

This document outlines all the routes in the TinyLink application, their purposes, paths, and authentication requirements.

## Route Overview Table

| Purpose | Path | Auth Required | Type | File Location |
|---------|------|---------------|------|---------------|
| Landing Page | `/` | Public | Page | `src/app/page.js` |
| Dashboard (list, add, delete) | `/dashboard` | **Protected** | Page | `src/app/dashboard/page.js` |
| Stats for a single code | `/code/:code` | Public | Page | `src/app/code/[code]/page.js` |
| Redirect | `/:code` | Public | Route | `src/app/[code]/route.js` |
| Health check | `/healthz` | Public | Route | `src/app/healthz/route.js` |
| User Registration | `/register` | Public | Page | `src/app/register/page.js` |
| User Login | `/login` | Public | Page | `src/app/login/page.js` |

---

## Detailed Route Descriptions

### 1. Landing Page (`/`)
- **File**: `src/app/page.js`
- **Type**: Client Component (Page)
- **Auth**: Public
- **Description**: Main landing page with hero section, features, and CTAs
- **Features**:
  - Displays different header based on authentication status
  - Shows "Go to Dashboard" button for authenticated users
  - Shows "Login" and "Get Started" buttons for guests
  - Features section highlighting app capabilities
  - Responsive design with gradient backgrounds

---

### 2. Dashboard (`/dashboard`)
- **File**: `src/app/dashboard/page.js`
- **Type**: Client Component (Page)
- **Auth**: **Protected** (requires login)
- **Description**: Main dashboard for authenticated users to manage their links
- **Features**:
  - Lists all links created by the user
  - Create new short links
  - Delete existing links
  - View click statistics for each link
  - Real-time updates when links are created/deleted
- **Components Used**:
  - `CreateLinkForm`: Form to create new short links
  - `LinkList`: Displays all user's links with stats
- **Auth Flow**:
  - Checks authentication via `/api/auth/me`
  - Redirects to `/login` if not authenticated

---

### 3. Stats Page (`/code/:code`)
- **File**: `src/app/code/[code]/page.js`
- **Type**: Client Component (Page)
- **Auth**: Public
- **Description**: Displays detailed statistics for a specific short link
- **Features**:
  - Shows total clicks
  - Displays creation date
  - Shows last clicked date
  - Displays original URL
  - Delete link button (requires authentication)
  - Back to dashboard link
- **API Used**: `GET /api/links/:code`

---

### 4. Redirect Route (`/:code`)
- **File**: `src/app/[code]/route.js`
- **Type**: API Route Handler
- **Auth**: Public
- **Description**: Handles redirection from short code to original URL
- **Behavior**:
  - Looks up the short code in the database
  - Increments click count
  - Updates `lastClickedAt` timestamp
  - Redirects to the original URL
  - Returns 404 if code not found
- **Example**: `https://yourdomain.com/abc123` → redirects to original URL

---

### 5. Health Check (`/healthz`)
- **File**: `src/app/healthz/route.js`
- **Type**: API Route Handler
- **Auth**: Public
- **Description**: Health check endpoint for monitoring
- **Response**:
  ```json
  {
    "ok": true,
    "version": "1.0",
    "database": "healthy"
  }
  ```
- **Error Response** (if DB fails):
  ```json
  {
    "ok": false,
    "error": "Database connection failed"
  }
  ```

---

### 6. User Registration (`/register`)
- **File**: `src/app/register/page.js`
- **Type**: Client Component (Page)
- **Auth**: Public
- **Description**: User registration page
- **API Used**: `POST /api/auth/register`
- **Redirects to**: `/dashboard` after successful registration

---

### 7. User Login (`/login`)
- **File**: `src/app/login/page.js`
- **Type**: Client Component (Page)
- **Auth**: Public
- **Description**: User login page
- **API Used**: `POST /api/auth/login`
- **Redirects to**: `/dashboard` after successful login

---

## API Routes

### Authentication APIs

| Endpoint | Method | Auth | Purpose | File Location |
|----------|--------|------|---------|---------------|
| `/api/auth/register` | POST | Public | Register new user | `src/app/api/auth/register/route.js` |
| `/api/auth/login` | POST | Public | Login user | `src/app/api/auth/login/route.js` |
| `/api/auth/logout` | POST | Protected | Logout user | `src/app/api/auth/logout/route.js` |
| `/api/auth/me` | GET | Protected | Get current user | `src/app/api/auth/me/route.js` |

### Link Management APIs

| Endpoint | Method | Auth | Purpose | File Location |
|----------|--------|------|---------|---------------|
| `/api/links` | GET | Protected | List all user's links | `src/app/api/links/route.js` |
| `/api/links` | POST | Protected | Create new short link | `src/app/api/links/route.js` |
| `/api/links/:code` | GET | Public | Get link details | `src/app/api/links/[code]/route.js` |
| `/api/links/:code` | DELETE | Protected | Delete a link | `src/app/api/links/[code]/route.js` |
| `/api/links/:code/click` | POST | Public | Record a click | `src/app/api/links/[code]/click/route.js` |

---

## Authentication Flow

### How Authentication Works

1. **Registration/Login**:
   - User submits credentials
   - Server validates and creates JWT token
   - Token stored in HTTP-only cookie
   - User redirected to dashboard

2. **Protected Routes**:
   - Dashboard checks authentication via `/api/auth/me`
   - If not authenticated, redirects to `/login`
   - If authenticated, displays user content

3. **Logout**:
   - Calls `/api/auth/logout`
   - Clears authentication cookie
   - Redirects to landing page

### JWT Token Details
- **Library**: `jose` (for JWT handling)
- **Storage**: HTTP-only cookies
- **Secret**: Stored in `JWT_SECRET` environment variable
- **Expiration**: Configurable (default: 7 days)

---

## Navigation Flow

```
Landing Page (/)
    ├─> Register (/register) ──> Dashboard (/dashboard)
    ├─> Login (/login) ──────────> Dashboard (/dashboard)
    └─> Stats (/code/:code)

Dashboard (/dashboard)
    ├─> Create Link ──> Refresh list
    ├─> View Stats ──> /code/:code
    ├─> Delete Link ──> Refresh list
    └─> Logout ──────> Landing Page (/)

Short Link (/:code)
    └─> Redirect to original URL
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."

# JWT Authentication
JWT_SECRET="your-secret-key-here"

# App URL (for generating short links)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  links     Link[]
}
```

### Link Model
```prisma
model Link {
  id            String    @id @default(cuid())
  code          String    @unique
  originalUrl   String
  clicks        Int       @default(0)
  createdAt     DateTime  @default(now())
  lastClickedAt DateTime?
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/healthz
```

### Create Link (requires auth)
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "customCode": "abc123"}'
```

### Get Link Stats
```bash
curl http://localhost:3000/api/links/abc123
```

### Test Redirect
```bash
curl -I http://localhost:3000/abc123
```

---

## Deployment Considerations

### Vercel Configuration
The `vercel.json` includes a custom build command:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

This ensures Prisma client is generated before building the Next.js app.

### Required Environment Variables on Vercel
1. `DATABASE_URL` - Neon Postgres connection string
2. `JWT_SECRET` - Secret key for JWT tokens
3. `NEXT_PUBLIC_APP_URL` - Your deployed app URL

---

## Security Notes

1. **Password Hashing**: Uses `bcryptjs` with salt rounds
2. **JWT Tokens**: Stored in HTTP-only cookies (not accessible via JavaScript)
3. **Protected Routes**: Server-side validation via middleware
4. **CORS**: Configured for same-origin requests
5. **SQL Injection**: Protected via Prisma ORM

---

## Future Enhancements

- [ ] Rate limiting for link creation
- [ ] Custom domains for short links
- [ ] QR code generation
- [ ] Link expiration dates
- [ ] Analytics dashboard with charts
- [ ] Bulk link creation
- [ ] Link editing capabilities
- [ ] Team collaboration features

---

## Maintenance Checklist

- [ ] Monitor `/healthz` endpoint for uptime
- [ ] Check database connection regularly
- [ ] Review JWT token expiration settings
- [ ] Monitor click tracking accuracy
- [ ] Backup database regularly
- [ ] Update dependencies monthly
- [ ] Review and rotate JWT_SECRET periodically

---

**Last Updated**: 2025-11-23
**Version**: 1.0
**Maintainer**: TinyLink Team
