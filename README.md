# LifeStack

LifeStack is a personal life management dashboard that combines todos, habit tracker,
expenses, and monthly planner into a single authenticated experience. It ships with a
Node/Express API and a static frontend served from the same server.

## Features
- JWT-based authentication with register/login
- Personal todo list with completion toggles
- Habit tracking with weekly progress and completion history
- Expense tracking with totals and category breakdown
- Calendar planner with monthly view and upcoming events
- Dashboard overview with summaries and quick actions

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT auth (jsonwebtoken + bcryptjs)
- Vanilla HTML/CSS/JS frontend served from `public/`

## Project Structure
```text
public/
  css/              Static styles
  js/               Frontend logic
  login.html        Auth entry page
  register.html     Registration page
  main.html         Main dashboard
server/
  config/           Database connection
  controllers/      API handlers
  middleware/       Auth middleware
  models/           Mongoose schemas
  routes/           API routes
  server.js         Express app entry
```

## Getting Started
1. Install dependencies
```bash
cd server
npm install
```
2. Configure environment variables in `server/.env`
```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lifestack
JWT_SECRET=your_secret_here
CLIENT_ORIGIN=http://localhost:5000
```
`CLIENT_ORIGIN` is optional when using the built-in static frontend.

3. Run the server
```bash
npm run dev
```
4. Open the app
```text
http://localhost:5000
```

## Scripts
Run from the `server/` directory.
- `npm run dev` Start the server with nodemon
- `npm start` Start the server in production mode

## API
All endpoints below require `Authorization: Bearer <token>` unless noted.

Auth (public)
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a new user |
| POST | `/api/auth/login` | Login and receive a token |

Todos
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/todos` | List todos |
| POST | `/api/todos` | Create a todo |
| PUT | `/api/todos/:id` | Update a todo |
| DELETE | `/api/todos/:id` | Delete a todo |

Habits
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/habits` | List habits |
| POST | `/api/habits` | Create a habit |
| PUT | `/api/habits/complete/:id` | Mark habit complete for today |
| DELETE | `/api/habits/:id` | Delete a habit |

Expenses
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/expenses/summary/month` | Monthly total |
| GET | `/api/expenses/summary/category` | Category breakdown |

Events
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/events` | List events |
| POST | `/api/events` | Create an event |
| GET | `/api/events/month?month=MM&year=YYYY` | Events by month |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

## Notes
- The server serves the frontend from `public/` at the root path.
- If you host a separate frontend, set `CLIENT_ORIGIN` to its origin.
