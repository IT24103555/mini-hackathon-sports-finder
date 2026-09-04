# Sports Finder

Sports Finder is a simple MERN web application for helping people in Sri Lanka discover casual cricket, football, and volleyball games nearby.

## Project Structure

- `server/` - Express API, Mongoose model, routes, and seed data
- `client/` - React and Vite user interface

## Requirements

- Node.js 18 or newer
- A MongoDB Atlas cluster or local MongoDB installation

## Setup

1. Configure the server:

   ```bash
   cd server
   npm install
   ```

   Open `server/.env` and replace `your_mongodb_uri` with your MongoDB connection string. The default port is `5000`.

2. Start the API:

   ```bash
   npm run dev
   ```

   On the first successful connection, six sample Sri Lankan games are inserted when the database has no games.

3. In a second terminal, configure and start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

The client expects the API at `http://localhost:5000`. Change `VITE_API_URL` if your backend uses another address.

## Team Contributions

- Member 1: Backend API, database model, and seed data
- Member 2: React interface and responsive styling
- Member 3: Testing, documentation, and deployment

Replace these placeholders with your team's names and specific contributions.

## Deployed Links

- Frontend: `[Add deployed frontend URL]`
- Backend API: `[Add deployed backend URL]`

## AI Tool Declaration

AI tools were used to assist with project scaffolding, code suggestions, and documentation. The team reviewed, tested, and adapted the generated code.
