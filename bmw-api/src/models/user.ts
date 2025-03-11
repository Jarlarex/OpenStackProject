import { ObjectId } from "mongodb";
import Joi from 'joi';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  role: UserRole;
  likedSubmodels?: { modelId: string, submodelId: string }[]; // Array of submodel IDs that the user has liked
  createdAt: Date;
  updatedAt: Date;
}

export const ValidateUser = (user: User) => {
  const userJoiSchema = Joi.object<User>({
    _id: Joi.any().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid(UserRole.USER, UserRole.ADMIN).required(),
    likedSubmodels: Joi.array().items(
      Joi.object({
        modelId: Joi.string().required(),
        submodelId: Joi.string().required()
      })
    ).optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
  });

  return userJoiSchema.validate(user);
};

export const ValidateUserUpdate = (user: Partial<User>) => {
  const userUpdateJoiSchema = Joi.object<Partial<User>>({
    email: Joi.string().email(),
    password: Joi.string().min(8),
    role: Joi.string().valid(UserRole.USER, UserRole.ADMIN),
    likedSubmodels: Joi.array().items(
      Joi.object({
        modelId: Joi.string().required(),
        submodelId: Joi.string().required()
      })
    ),
    updatedAt: Joi.date()
  });

  return userUpdateJoiSchema.validate(user);
};

export const ValidateLogin = (credentials: { email: string; password: string }) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return loginSchema.validate(credentials);
};
