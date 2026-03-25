# RequestHub

**RequestHub** is a modern, full-stack request management system designed to streamline and automate organizational workflows. Built with the MERN stack (MongoDB, Express, React, Node.js), it features real-time notifications, workflow automation via n8n integration, and a sleek, responsive user interface.

## 🚀 Key Features

- **Authentication & Security**: Secure user login and registration using JWT (JSON Web Tokens) and password hashing with BcryptJS.
- **Real-time Updates**: Instant notifications and live status updates powered by Socket.io.
- **Request Lifecycle Management**: Full CRUD operations for creating, tracking, and managing service requests.
- **Workflow Automation (n8n)**: Integrated API endpoints for connecting with n8n workflows for automated task processing.
- **Dynamic Dashboard**: Interactive data visualization using Recharts to monitor request statistics and performance.
- **File Upload Support**: Seamless attachment handling using Multer.
- **Modern UI/UX**: A highly responsive and animated interface built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**: Core framework for building the user interface.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Framer Motion**: Library for creating fluid animations and transitions.
- **Lucide React**: Beautifully simple icons.
- **Recharts**: Composable charting library for data visualization.
- **React Router**: Client-side routing for the single-page application.

### Backend
- **Node.js & Express**: Scalable server-side environment and API framework.
- **MongoDB & Mongoose**: Flexible NoSQL database with schema modeling.
- **Socket.io**: Real-time bidirectional communication.
- **Nodemailer**: Automated email notifications.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).
- **JWT**: Secure token-based authentication.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local instance or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Ruchitha7529/RequestHub.git
cd RequestHub
```

### 2. Configure Backend
Navigate to the server directory and install dependencies:
```bash
cd RequestHub-main/server
npm install
```
Create a `.env` file in the `server` directory and add your configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Configure Frontend
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

### 4. Running the Application

**Start the Backend Server:**
```bash
cd ../server
npm run dev
```

**Start the Frontend Dev Server:**
```bash
cd ../client
npm run dev
```

The application should now be running!

## 📝 License
Distributed under the ISC License.
