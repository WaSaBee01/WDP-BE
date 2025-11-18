import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { createMeal, deleteMeal, getAllMeals, updateMeal } from '../controllers/adminMealController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate as any);
router.use(requireRole('admin') as any);

// Admin meal routes
router.get('/', getAllMeals as any);
router.post('/', createMeal as any);
router.put('/:id', updateMeal as any);
router.delete('/:id', deleteMeal as any);

export default router;

