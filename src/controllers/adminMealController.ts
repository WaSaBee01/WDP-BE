import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Meal } from '../models';

interface CreateMealRequest {
  name: string;
  description?: string;
  image?: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  weightGrams: number;
}

export const getAllMeals = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { search } = req.query;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$text = { $search: search as string };
    }

    const meals = await Meal.find(filter).populate('createdBy', 'name email');
    
    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get meals',
    });
  }
};

export const createMeal = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { name, description, image, calories, carbs, protein, fat, weightGrams }: CreateMealRequest = req.body;

    // Validate required fields
    if (
      !name ||
      calories === undefined ||
      carbs === undefined ||
      protein === undefined ||
      fat === undefined ||
      weightGrams === undefined
    ) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, calories, carbs, protein, fat và weightGrams là bắt buộc',
      });
    }

    // Validate numbers
    if (calories < 0 || carbs < 0 || protein < 0 || fat < 0 || weightGrams < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Nutrition values/weight cannot be negative',
      });
    }

    const meal = await Meal.create({
      name,
      description,
      image,
      calories,
      carbs,
      protein,
      fat,
      weightGrams,
      isCommon: true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: (err as { message?: string }).message || 'Validation error',
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create meal',
    });
  }
};

export const updateMeal = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate numbers if provided
    if (updateData.calories !== undefined && updateData.calories < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Calories cannot be negative',
      });
    }
    if (updateData.carbs !== undefined && updateData.carbs < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Carbs cannot be negative',
      });
    }
    if (updateData.protein !== undefined && updateData.protein < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Protein cannot be negative',
      });
    }
    if (updateData.fat !== undefined && updateData.fat < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Fat cannot be negative',
      });
    }
    if (updateData.weightGrams !== undefined && updateData.weightGrams < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Weight cannot be negative',
      });
    }

    const meal = await Meal.findByIdAndUpdate(id, updateData, { new: true });

    if (!meal) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Meal not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: (err as { message?: string }).message || 'Validation error',
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update meal',
    });
  }
};

export const deleteMeal = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { id } = req.params;

    const meal = await Meal.findByIdAndDelete(id);

    if (!meal) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Meal not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete meal',
    });
  }
};

