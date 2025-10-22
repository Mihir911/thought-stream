# Modern MERN Blogging Platform

A full-stack blogging application built with the MERN (MongoDB, Express.js, React, Node.js) stack.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB
- **JSON Web Tokens (JWT)**: For authentication
- **bcryptjs**: For password hashing
- **cors**: For enabling Cross-Origin Resource Sharing
- **dotenv**: For managing environment variables

### Frontend
- **React**: (Intended for the `client` directory)

## Project Structure

```
blogging-platform/
├── client/         # Frontend React application (currently empty)
├── server/         # Backend Express.js application
│   ├── config/
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose data models
│   ├── node_modules/
│   ├── routes/       # API routes
│   ├── utils/
│   ├── .env          # Environment variables
│   ├── package.json
│   ├── server.js     # Server entry point
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd blogging-platform
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory and add the following variables:
   ```
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. **Run the backend server:**
   ```bash
   npm start
   ```
   Or for development with auto-reloading:
   ```bash
   npm run dev
   ```

5. **(Future) Set up the frontend:**
   Once the React client is created:
   ```bash
   cd ../client
   npm install
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/register`: Register a new user.
  - **Body**: `{ "username": "test", "email": "test@example.com", "password": "password123" }`
- `POST /api/auth/login`: Login a user and get a JWT token.
  - **Body**: `{ "email": "test@example.com", "password": "password123" }`

### Blogs
- `GET /api/blogs`: Get all blog posts.
- `GET /api/blogs/:id`: Get a single blog post by its ID.
- `POST /api/blogs`: Create a new blog post (requires authentication).
  - **Body**: `{ "title": "My First Blog", "content": "This is the content." }`
- `PUT /api/blogs/:id`: Update a blog post (requires authentication).
  - **Body**: `{ "title": "Updated Title", "content": "Updated content." }`
- `DELETE /api/blogs/:id`: Delete a blog post (requires authentication).
