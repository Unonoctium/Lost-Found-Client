# Lost and Found Application

A MERN stack application for managing lost and found items.

## Features

- User authentication and authorization
- Submit lost or found items
- Upload images for items
- Search and filter items by category
- Real-time chat between users
- Admin dashboard for content moderation
- Notification system
- Report inappropriate content

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

4. Create uploads directory in server:
```bash
mkdir server/uploads
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Users
- POST /api/users/register - Register new user
- POST /api/users/login - User login
- GET /api/users/profile - Get user profile
- GET /api/users/notifications - Get user notifications
- PUT /api/users/notifications/:id - Mark notification as read

### Items
- POST /api/items - Create new item
- GET /api/items - Get all approved items
- GET /api/items/pending - Get pending items (admin only)
- GET /api/items/:id - Get single item
- PUT /api/items/:id/status - Update item status (admin only)
- PUT /api/items/:id/return - Mark item as returned
- POST /api/items/:id/report - Report an item

### Chat
- POST /api/chat - Create or get chat
- GET /api/chat - Get user's chats
- GET /api/chat/:id - Get single chat
- POST /api/chat/:id/messages - Send message

## Technologies Used

- Frontend:
  - React.js
  - Material-UI
  - Socket.IO Client
  - React Router
  - Axios
  - React Toastify

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Socket.IO
  - JWT Authentication
  - Multer (File Upload)

## Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Admin Authorization
- File Upload Validation
- Input Validation
