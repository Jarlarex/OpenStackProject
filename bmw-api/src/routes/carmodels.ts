import express, { Router } from 'express';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import {
    getAllModels,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    getSubmodelsByModelId,
    getModelByName,
    getSubmodelById,
    addSubmodel,
    updateSubmodel,
    deleteSubmodel,
    likeModel,
    unlikeModel,
    getMostLikedModels
} from '../controllers/carModels';

const router: Router = express.Router();

// Public routes - anyone can view models and submodels
router.get('/', getAllModels);
router.get('/popular', getMostLikedModels);
router.get('/:id', getModelById);
router.get('/:id/submodels', getSubmodelsByModelId);
router.get('/name/:name', getModelByName);
router.get('/:id/submodels/:submodelId', getSubmodelById);

// Protected routes - only admins can create, update, delete models and submodels
router.post('/', authenticateJWT, authorizeAdmin, createModel);
router.put('/:id', authenticateJWT, authorizeAdmin, updateModel);
router.delete('/:id', authenticateJWT, authorizeAdmin, deleteModel);
router.post('/:id/submodels', authenticateJWT, authorizeAdmin, addSubmodel);
router.put('/:id/submodels/:submodelId', authenticateJWT, authorizeAdmin, updateSubmodel);
router.delete('/:id/submodels/:submodelId', authenticateJWT, authorizeAdmin, deleteSubmodel);

// Like/unlike routes - authenticated users can like/unlike models
router.post('/:id/like', authenticateJWT, likeModel);
router.post('/:id/unlike', authenticateJWT, unlikeModel);


export default router;
