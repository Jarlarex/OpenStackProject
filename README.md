# BMW E-Chassis Application

A modern web application for managing BMW car models and their specifications, built with Angular and Express.

## Features

### Core Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Model Management**: Admin users can add, edit, and delete BMW models and submodels
- **User Interaction**: Users can view models and like their favorites
- **Responsive Design**: Modern UI built with Angular Material
- **State Management**: Efficient state management using Angular Signals
- **Cloud Deployment**: Docker configuration for easy deployment to AWS

### Car Details
- Comprehensive model information including:
  - Production numbers and yearly breakdown
  - Awards and recognition history
  - Notable features and innovations
  - Special technology packages
  - Performance variants
  - Technical specifications (dimensions, weight, performance)

### Mobile Support
- Fully responsive design for all screen sizes
- Touch-friendly interface
- Optimized navigation for mobile devices

## Technology Stack

### Backend (Node.js + Express)
- **Express.js**: Fast, unopinionated web framework for Node.js
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: NoSQL database for storing car models and user data
- **JWT Authentication**: Secure authentication mechanism
- **Joi**: Schema validation

### Frontend (Angular 17)
- **Angular 17**: Modern web framework with standalone components
- **Angular Material**: Material Design components for Angular
- **Angular Signals**: Reactive state management
- **TypeScript**: Type-safe JavaScript

### DevOps & Deployment
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Multi-container Docker applications
- **GitHub Actions**: Automated CI/CD pipeline
- **Render**: Cloud hosting platform

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

### Local Docker Deployment

1. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_USERNAME=your_username
   MONGO_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   ```

2. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application at `http://localhost`

### Production Deployment (Render)

1. Fork this repository to your GitHub account

2. Set up GitHub Secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token
   - `RENDER_API_KEY`: Your Render API key
   - `RENDER_SERVICE_ID`: Your Render service ID

3. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Choose "Docker" as the environment
   - Set the following environment variables:
     ```
     MONGO_USERNAME=your_username
     MONGO_PASSWORD=your_password
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     ```

4. The GitHub Actions workflow will automatically:
   - Run tests
   - Build Docker images
   - Push to Docker Hub
   - Deploy to Render

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Models Endpoints

#### Get All Models
```http
GET /api/v1/models
Authorization: Bearer jwt_token

Response: {
  "models": [
    {
      "id": "model_id",
      "name": "Model Name",
      "yearIntroduced": 2020,
      "yearDiscontinued": 2023,
      "description": "Model description",
      "submodels": [...],
      "productionNumbers": {
        "total": 50000,
        "yearlyBreakdown": {
          "2020": 15000,
          "2021": 20000,
          "2022": 15000
        }
      },
      "awards": [...],
      "notableFeatures": [...],
      "specialTechnology": [...]
    }
  ]
}
```

#### Create Model (Admin Only)
```http
POST /api/v1/models
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Model Name",
  "yearIntroduced": 2020,
  "yearDiscontinued": 2023,
  "description": "Model description",
  "submodels": [...],
  "productionNumbers": {
    "total": 50000,
    "yearlyBreakdown": {
      "2020": 15000,
      "2021": 20000,
      "2022": 15000
    }
  }
}

Response: {
  "message": "Model created successfully",
  "model": {...}
}
```

### Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message:
```json
{
  "message": "Error description"
}
```

### Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

### Mobile Testing

The application is optimized for mobile devices. Test the responsive design by:
1. Using Chrome DevTools device emulation
2. Testing on physical devices
3. Verifying touch interactions work correctly
4. Ensuring navigation menu is accessible on small screens

## License

This project is licensed under the MIT License.
