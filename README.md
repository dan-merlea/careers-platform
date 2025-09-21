# Hatch Beacon

*The beacon for hiring success*

A full-stack recruitment platform with a NextJS frontend, NestJS backend, and React admin panel.

## Project Structure

This repository contains three main components:

1. **careers-web**: NextJS frontend for job seekers and employers
2. **careers-server**: NestJS backend API with MongoDB integration
3. **careers-admin**: React admin panel for platform management

## Features

### Frontend (careers-web)
- Modern UI built with NextJS and Tailwind CSS
- Responsive design for all devices
- User authentication (login, signup, password reset)
- Landing page with features overview
- Pricing page with subscription plans
- Contact page with form submission

### Backend (careers-server)
- RESTful API built with NestJS
- MongoDB integration with Mongoose
- User authentication with JWT tokens
- Password hashing with bcrypt
- Modular architecture with services and controllers

### Admin Panel (careers-admin)
- Secure admin login with authentication protection
- Dashboard with analytics overview
- System setup configuration
- User management
- Job posting management
- Reports and analytics

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or remote connection)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/careers-platform.git
cd careers-platform
```

2. Install dependencies for each project:
```bash
# Install backend dependencies
cd careers-server
npm install

# Install frontend dependencies
cd ../careers-web
npm install

# Install admin panel dependencies
cd ../careers-admin
npm install
```

3. Configure environment variables:
   - Create `.env` files in each project directory as needed
   - Set MongoDB connection string in the server project

### Running the Applications

#### Backend Server
```bash
cd careers-server
npm run start:dev
```
The server will run on http://localhost:3001

#### Frontend Web App
```bash
cd careers-web
npm run dev
```
The web app will run on http://localhost:3000

#### Admin Panel
```bash
cd careers-admin
npm start
```
The admin panel will run on http://localhost:3002

## Authentication Flow

1. User registers or logs in through the frontend
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is included in subsequent API requests
5. Admin panel uses the same authentication system with additional role checks

## Development

### Adding New Features
- Frontend: Add new pages in the `careers-web/src/app` directory
- Backend: Create new modules, controllers, and services in the `careers-server/src` directory
- Admin: Add new pages in the `careers-admin/src/pages` directory

### Database Schema
The MongoDB database uses the following main collections:
- Users: User accounts with authentication details
- Jobs: Job postings with details and requirements
- Applications: Job applications submitted by users

## License
This project is licensed under the MIT License - see the LICENSE file for details.
