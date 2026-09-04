# Sports Finder

Sports Finder is a MERN application that helps Sri Lankans find casual sports games nearby.

## Selected Problem

Sri Lankans cannot easily find casual games because invitations are scattered across social media groups and personal networks.

## Proposed Solution

Sports Finder provides one simple place to discover open local games or create an invitation for other players.

## Main Features

- Browse casual cricket, football, and volleyball games
- Filter games by sport
- Create a game with a title, location, time, and maximum player count
- Client-side and server-side validation
- Seed sample games when the database is empty

## Technologies

- MongoDB and Mongoose
- Express and Node.js
- React, Vite, and Axios
- CORS and dotenv

## AI Tools Used

AI tools were used for project scaffolding, code suggestions, debugging support, and documentation. The team reviewed and adapted all generated content.

## Team Contributions

| Team member | ID | Role and contribution |
| --- | --- | --- |
| Member 1: [Name] | [ID] | Backend API, database model, and seed data |
| Member 2: [Name] | [ID] | React interface and responsive styling |
| Member 3: [Name] | [ID] | Testing, documentation, and deployment |

## Installation

### Server

```bash
cd server
npm install
```

Create `server/.env` and set the MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Start the API:

```bash
npm run dev
```

### Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The client uses `http://localhost:5000` by default. Set `VITE_API_URL` in `client/.env` when the API is deployed elsewhere.

## Deployment

Before deployment, run `npm run build` in `/client` and deploy the generated `dist/` folder to Vercel or Netlify. Replace the local API URL in the axios calls with the live Render URL.

- Deployed application: [Add deployed application URL]
- Demo video: [Add demo video URL]
