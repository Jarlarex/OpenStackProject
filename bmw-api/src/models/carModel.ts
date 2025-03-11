import { ObjectId } from "mongodb";
import Joi from 'joi';

export interface Submodel {
  _id?: ObjectId;
  name: string;
  engineType: string;
  horsepower: number;
  torque: number;
  transmission: string;
  year: number;
  imageURL?: string;
  // Additional fields for more details
  weight?: number;
  acceleration?: number; // 0-60 mph time in seconds
  topSpeed?: number;
  fuelEconomy?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
  };
}

export interface Model {
  _id?: ObjectId;
  name: string;
  yearIntroduced: number;
  yearDiscontinued: number;
  description: string;
  submodels: Submodel[];
  // Additional fields
  country?: string;
  designer?: string;
  bodyStyle?: string;
  platform?: string;
  predecessor?: string;
  successor?: string;
  imageURL?: string;
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const ValidateSubmodel = (submodel: Submodel) => {
  const submodelJoiSchema = Joi.object<Submodel>({
    _id: Joi.any().optional(),
    name: Joi.string().required(),
    engineType: Joi.string().required(),
    horsepower: Joi.number().required(),
    torque: Joi.number().required(),
    transmission: Joi.string().required(),
    year: Joi.number().required(),
    imageURL: Joi.string().optional(),
    // Additional fields validation
    weight: Joi.number().optional(),
    acceleration: Joi.number().optional(),
    topSpeed: Joi.number().optional(),
    fuelEconomy: Joi.string().optional(),
    dimensions: Joi.object({
      length: Joi.number().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
      wheelbase: Joi.number().optional(),
    }).optional(),
  });

  return submodelJoiSchema.validate(submodel);
};

export const ValidateModel = (model: Model) => {
  const modelJoiSchema = Joi.object<Model>({
    _id: Joi.any().optional(),
    name: Joi.string().required(),
    yearIntroduced: Joi.number().required(),
    yearDiscontinued: Joi.number().required(),
    description: Joi.string().required(),
    submodels: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        engineType: Joi.string().required(),
        horsepower: Joi.number().required(),
        torque: Joi.number().required(),
        transmission: Joi.string().required(),
        year: Joi.number().required(),
        imageURL: Joi.string().optional(),
        weight: Joi.number().optional(),
        acceleration: Joi.number().optional(),
        topSpeed: Joi.number().optional(),
        fuelEconomy: Joi.string().optional(),
        dimensions: Joi.object().optional(),
      })
    ).optional(),
    // Additional fields validation
    country: Joi.string().optional(),
    designer: Joi.string().optional(),
    bodyStyle: Joi.string().optional(),
    platform: Joi.string().optional(),
    predecessor: Joi.string().optional(),
    successor: Joi.string().optional(),
    imageURL: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  });

  return modelJoiSchema.validate(model);
};


export const ValidateModelUpdate = (model: Partial<Model>) => {
  const modelUpdateJoiSchema = Joi.object<Partial<Model>>({
    name: Joi.string(),
    yearIntroduced: Joi.number(),
    yearDiscontinued: Joi.number(),
    description: Joi.string(),
    submodels: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        engineType: Joi.string(),
        horsepower: Joi.number(),
        torque: Joi.number(),
        transmission: Joi.string(),
        year: Joi.number(),
        imageURL: Joi.string().optional(),
        weight: Joi.number().optional(),
        acceleration: Joi.number().optional(),
        topSpeed: Joi.number().optional(),
        fuelEconomy: Joi.string().optional(),
        dimensions: Joi.object().optional(),
      })
    ),
    // Additional fields validation for update
    country: Joi.string(),
    designer: Joi.string(),
    bodyStyle: Joi.string(),
    platform: Joi.string(),
    predecessor: Joi.string(),
    successor: Joi.string(),
    imageURL: Joi.string(),
    updatedAt: Joi.date(),
  });

  return modelUpdateJoiSchema.validate(model);
};
