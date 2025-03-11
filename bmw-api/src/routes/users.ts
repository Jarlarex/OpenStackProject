import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  likeSubmodel,
  unlikeSubmodel,
  getLikedSubmodels
} from '../controllers/users';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', authenticateJWT, authorizeAdmin, getAllUsers);
router.get('/:id', authenticateJWT, getUserById);
router.put('/:id', authenticateJWT, updateUser);
router.delete('/:id', authenticateJWT, authorizeAdmin, deleteUser);

// Like/unlike routes
router.post('/:id/like', authenticateJWT, likeSubmodel);
router.post('/:id/unlike', authenticateJWT, unlikeSubmodel);
router.get('/:id/liked', authenticateJWT, getLikedSubmodels);

export default router;
