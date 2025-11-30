# eFootball League Registration App

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Supabase, Neon, or Local)
- Email Service Credentials (Gmail App Password or similar)

### Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `DATABASE_URL` with your PostgreSQL connection string.
   - Update `EMAIL_USER` and `EMAIL_PASS` with your email credentials.
4. Sync Database Schema:
   ```bash
   npx prisma db push
   ```
5. Start the Server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```

## Features
- **Registration**: Register with Name, Email, Address, League, and Club.
- **Dynamic Selection**: Club options update based on selected League.
- **Email Notification**: Receive a confirmation email upon registration.
- **Player Table**: View all registered players with pagination.
- **Playoffs**: Generate random playoff matchups via `/api/playoffs`.

## API Endpoints
- `POST /api/register`: Register a new player.
- `GET /api/players`: Get paginated list of players.
- `GET /api/playoffs`: Generate playoff matchups.
