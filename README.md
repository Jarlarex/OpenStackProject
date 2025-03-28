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
