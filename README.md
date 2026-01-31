# WAIOne - Shared Database Mobile Apps

This project consists of two Expo mobile applications (HealthyWAI and DispatchWAI) that share a common PostgreSQL database through a Node.js/Express REST API backend.

## Architecture

- **Backend API**: Node.js/Express with PostgreSQL, Sequelize ORM
- **Mobile Apps**: Expo (React Native) apps
  - HealthyWAI
  - DispatchWAI
- **Shared Components**: API client library for both apps
- **Database**: PostgreSQL (shared between both apps)

## Project Structure

```
waione/
├── backend/              # Backend API server
├── healthywai/          # HealthyWAI mobile app
├── dispatchwai/         # DispatchWAI mobile app
├── shared/              # Shared API client library
└── docker-compose.yml   # PostgreSQL database setup
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for local database)
- Expo CLI (`npm install -g expo-cli`)

## Setup Instructions

### 1. Database Setup

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend API will run on `http://localhost:3000`

### 3. Shared API Client Setup

The mobile apps use a shared API client library located in `shared/api-client/`. The apps import this directly using relative paths. For production, you may want to:

- Publish the shared library as an npm package, or
- Use npm/yarn workspaces, or
- Copy the shared code into each app

For development, the current relative path imports will work.

### 4. Mobile Apps Setup

#### HealthyWAI

```bash
cd healthywai
npm install
npm start
```

#### DispatchWAI

```bash
cd dispatchwai
npm install
npm start
```

**Note**: Both mobile apps import the shared API client from `../../shared/api-client/src/index`. Make sure the relative path is correct when running the apps.

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory based on `.env.example`:

- Database connection settings
- JWT secrets
- OAuth credentials (Google, Apple, Facebook)
- CORS origins

### Mobile Apps

Update `app.json` in each mobile app to set the API URL:

```json
{
  "extra": {
    "apiUrl": "http://localhost:3000/api"
  }
}
```

For production, use your deployed backend URL.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **OAuth**: Google, Apple, and Facebook OAuth support
- **CRUD Operations**: Full CRUD operations on shared resources
- **User Management**: User registration, login, profile management
- **Shared Database**: Both apps access the same PostgreSQL database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Resources
- `GET /api/resources` - List all resources
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

## Development

### Running Migrations

```bash
cd backend
npm run migrate
```

### Database Seeding

```bash
cd backend
npm run seed
```

## License

ISC

