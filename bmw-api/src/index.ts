import express, { Application } from 'express';
import morgan from 'morgan';
import carModelRoutes from './routes/carmodels';
import userRoutes from './routes/users';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 10000;

export const app: Application = express();

// Configure CORS to accept all origins in development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://bmw-frontend.onrender.com', 'https://openstackproject.onrender.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// Enable preflight for all routes
app.options('*', cors(corsOptions));

app.use(morgan('tiny'));
app.use(express.json());

// Root path handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'BMW API Server',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// API Routes
app.use('/api/v1/models', carModelRoutes);
app.use('/api/v1/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log('Server running on port -- ', PORT);
});
