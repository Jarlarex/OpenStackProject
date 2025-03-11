import { Request, Response } from 'express';
import { usersCollection, carModelsCollection } from '../database';
import { User, UserRole, ValidateLogin, ValidateUser, ValidateUserUpdate } from '../models/user';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = (await usersCollection.find({}, { projection: { password: 0 } }).toArray()) as Omit<User, 'password'>[];
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const user = (await usersCollection.findOne(query, { projection: { password: 0 } })) as Omit<User, 'password'>;

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: `User not found with id: ${id}` });
    }
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    res.status(400).json({ message: `Invalid user ID: ${id}` });
  }
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  const validateResult = ValidateUser(req.body);

  if (validateResult.error) {
    return res.status(400).json({ message: validateResult.error.message });
  }

  try {
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const currentDate = new Date();
    
    // Create new user with default role as USER unless specified as ADMIN
    const newUser: User = {
      ...req.body,
      password: hashedPassword,
      role: req.body.role || UserRole.USER,
      likedSubmodels: [],
      createdAt: currentDate,
      updatedAt: currentDate
    };

    const result = await usersCollection.insertOne(newUser);

    if (result.acknowledged) {
      // Create JWT token
      const token = jwt.sign(
        { 
          id: result.insertedId.toString(),
          email: newUser.email,
          role: newUser.role
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );

      res.status(201).json({
        message: `User registered successfully`,
        token,
        user: {
          id: result.insertedId,
          email: newUser.email,
          role: newUser.role
        }
      });
    } else {
      res.status(500).json({ message: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const validateResult = ValidateLogin(req.body);

  if (validateResult.error) {
    return res.status(400).json({ message: validateResult.error.message });
  }

  try {
    // Find user by email
    const user = await usersCollection.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id?.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatedUser = req.body as Partial<User>;

  const validateResult = ValidateUserUpdate(updatedUser);
  if (validateResult.error) {
    return res.status(400).json({ message: validateResult.error.message });
  }

  try {
    const query = { _id: new ObjectId(id) };
    
    // If password is being updated, hash it
    if (updatedUser.password) {
      const salt = await bcrypt.genSalt(10);
      updatedUser.password = await bcrypt.hash(updatedUser.password, salt);
    }

    const update = {
      $set: {
        ...updatedUser,
        updatedAt: new Date()
      }
    };

    const result = await usersCollection.updateOne(query, update);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `User updated successfully` });
    } else {
      res.status(404).json({ message: `User not found with id: ${id}` });
    }
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);

    if (result && result.deletedCount > 0) {
      res.status(200).json({ message: `User deleted successfully` });
    } else {
      res.status(404).json({ message: `User not found with id: ${id}` });
    }
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Like a submodel
export const likeSubmodel = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { modelId, submodelId } = req.body;

  if (!modelId || !submodelId) {
    return res.status(400).json({ message: 'Model ID and Submodel ID are required' });
  }

  try {
    // Check if the submodel exists
    const model = await carModelsCollection.findOne({ 
      _id: new ObjectId(modelId),
      'submodels._id': new ObjectId(submodelId)
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Submodel not found' });
    }
    
    // Add the submodel to the user's liked submodels if not already liked
    const result = await usersCollection.updateOne(
      { 
        _id: new ObjectId(userId), 
        likedSubmodels: { 
          $not: { 
            $elemMatch: { 
              modelId: modelId, 
              submodelId: submodelId 
            } 
          } 
        } 
      },
      { $push: { likedSubmodels: { modelId, submodelId } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Submodel liked successfully' });
    } else {
      // Check if the user exists
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If user exists but no modification, the submodel is already liked
      res.status(200).json({ message: 'Submodel already liked by this user' });
    }
  } catch (error) {
    console.error('Error liking submodel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unlike a submodel
export const unlikeSubmodel = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { modelId, submodelId } = req.body;

  if (!modelId || !submodelId) {
    return res.status(400).json({ message: 'Model ID and Submodel ID are required' });
  }

  try {
    // Remove the submodel from the user's liked submodels
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { likedSubmodels: { modelId, submodelId } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Submodel unliked successfully' });
    } else {
      // Check if the user exists
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If user exists but no modification, the submodel was not liked
      res.status(200).json({ message: 'Submodel was not liked by this user' });
    }
  } catch (error) {
    console.error('Error unliking submodel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get liked submodels for a user
export const getLikedSubmodels = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the full details of each liked submodel
    const likedSubmodels = user.likedSubmodels || [];
    const detailedLikedSubmodels = [];

    for (const like of likedSubmodels) {
      const model = await carModelsCollection.findOne({ _id: new ObjectId(like.modelId) });
      if (model) {
        const submodel = model.submodels.find(
          sub => sub._id && sub._id.toString() === like.submodelId
        );
        
        if (submodel) {
          detailedLikedSubmodels.push({
            modelId: like.modelId,
            modelName: model.name,
            submodelId: like.submodelId,
            submodel: submodel
          });
        }
      }
    }

    res.status(200).json({ likedSubmodels: detailedLikedSubmodels });
  } catch (error) {
    console.error('Error getting liked submodels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
