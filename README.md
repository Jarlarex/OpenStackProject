# BMW E-Chassis Application

A modern web application for managing BMW car models and their specifications, built with Angular and Express.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Model Management**: Admin users can add, edit, and delete BMW models and submodels
- **User Interaction**: Users can view models and like their favorites
- **Responsive Design**: Modern UI built with Angular Material
- **State Management**: Efficient state management using Angular Signals
- **Cloud Deployment**: Docker configuration for easy deployment to AWS

## Technology Stack

### Backend
- **Express.js**: Fast, unopinionated web framework for Node.js
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: NoSQL database for storing car models and user data
- **JWT Authentication**: Secure authentication mechanism
- **Joi**: Schema validation

### Frontend
- **Angular 17**: Modern web framework with standalone components
- **Angular Material**: Material Design components for Angular
- **Angular Signals**: Reactive state management
- **TypeScript**: Type-safe JavaScript

### DevOps
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Multi-container Docker applications

## Project Structure

```
├── bmw-api/                 # Backend Express API
│   ├── src/                 # Source code
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   ├── Dockerfile           # Backend Docker configuration
│   └── package.json         # Dependencies
│
├── BmwApiPt2/               # Frontend Angular application
│   ├── src/                 # Source code
│   │   ├── app/             # Application code
│   │   │   ├── components/  # Angular components
│   │   │   ├── services/    # Data services
│   │   │   └── interceptors/# HTTP interceptors
│   │   └── assets/          # Static assets
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json         # Dependencies
│
├── docker-compose.yml       # Docker Compose configuration
└── .env                     # Environment variables
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Set up environment variables in `.env` file
3. Install dependencies:
   ```
   cd bmw-api; npm install
   cd ../BmwApiPt2; npm install
   ```

### Development

1. Start the backend:
   ```
   cd bmw-api; npm run dev
   ```

2. Start the frontend:
   ```
   cd BmwApiPt2; npm start
   ```

3. Access the application at `http://localhost:4200`

### Docker Deployment

1. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

2. Access the application at `http://localhost`

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login and get JWT token

### Models
- `GET /api/v1/models` - Get all models
- `GET /api/v1/models/popular` - Get most liked models
- `GET /api/v1/models/:id` - Get model by ID
- `POST /api/v1/models` - Create a new model (admin only)
- `PUT /api/v1/models/:id` - Update a model (admin only)
- `DELETE /api/v1/models/:id` - Delete a model (admin only)

### Submodels
- `GET /api/v1/models/:id/submodels` - Get all submodels for a model
- `GET /api/v1/models/:id/submodels/:submodelId` - Get submodel by ID
- `POST /api/v1/models/:id/submodels` - Add a submodel (admin only)
- `PUT /api/v1/models/:id/submodels/:submodelId` - Update a submodel (admin only)
- `DELETE /api/v1/models/:id/submodels/:submodelId` - Delete a submodel (admin only)

### User Interactions
- `POST /api/v1/models/:id/like` - Like a model
- `POST /api/v1/models/:id/unlike` - Unlike a model
- `GET /api/v1/users/:id/liked` - Get user's liked models

## License

This project is licensed under the MIT License.
