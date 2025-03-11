import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user';

// Define interface for JWT payload
interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

// Extend Express Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

// Legacy API key authentication (for backward compatibility)
export const authenticateKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
        res.status(401).json({ message: 'Unauthorized: Invalid API key' });
        return;
    }

    next();
};

// JWT authentication middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Admin authorization middleware
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }

    if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        return;
    }

    next();
};

// Owner or admin authorization middleware
export const authorizeOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }

    const userId = req.params.id;
    
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
        return;
    }

    next();
};
