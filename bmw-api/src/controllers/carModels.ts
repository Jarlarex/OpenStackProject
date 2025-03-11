import { Request, Response } from 'express';
import { carModelsCollection } from '../database';
import { Model, ValidateModel, ValidateModelUpdate, ValidateSubmodel } from '../models/carModel';
import { ObjectId } from 'mongodb';
import Joi from 'joi';

export const getAllModels = async (req: Request, res: Response) => {
  try {
    const model = (await carModelsCollection.find({}).toArray()) as Model[];
    res.status(200).json(model);
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getModelById = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const model = (await carModelsCollection.findOne(query)) as Model;

    if (model) {
      res.status(200).json(model);
    } else {
      res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
  } catch (error) {
    console.error(`Error fetching car model with id ${id}:`, error);
    res.status(400).json({ message: `Invalid car model ID: ${id}` });
  }
};

export const createModel = async (req: Request, res: Response) => {
  let validateResult: Joi.ValidationResult = ValidateModel(req.body);

  if (validateResult.error) {
    res.status(400).json(validateResult.error);
    return;
  }

  try {
    const currentDate = new Date();

    const newModel: Model = {
      ...req.body,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    const result = await carModelsCollection.insertOne(newModel);

    if (result.acknowledged) {
      res.status(201).location(`${result.insertedId}`).json({
        message: `Created a new car model with id: ${result.insertedId}`,
      });
    } else {
      res.status(500).json({ message: 'Failed to create a new car model.' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Issue with inserting car model: ${error.message}`);
    } else {
      console.log(`Unknown error inserting car model: ${error}`);
    }
    res.status(400).json({ message: 'Unable to create new car model' });
  }
};

export const updateModel = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatedModel = req.body as Partial<Model>;

  let validateResult: Joi.ValidationResult = ValidateModelUpdate(updatedModel);

  if (validateResult.error) {
    res.status(400).json(validateResult.error);
    return;
  }

  try {
    const query = { _id: new ObjectId(id) };

    const update = {
      $set: {
        ...updatedModel,
        updatedAt: new Date(),
      },
    };

    const result = await carModelsCollection.updateOne(query, update);

    if (result.modifiedCount > 0) {
      res.status(200).json({
        message: `Successfully updated car model with id: ${id}`,
      });
    } else {
      res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error updating car model with id ${id}: ${error.message}`);
    } else {
      console.log(`Unknown error updating car model with id ${id}: ${error}`);
    }
    res.status(400).json({ message: `Failed to update car model with id: ${id}` });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await carModelsCollection.deleteOne(query);

    if (result && result.deletedCount > 0) {
      res.status(202).json({ message: `Successfully removed car model with id ${id}` });
    } else {
      res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
  } catch (error) {
    console.error('Error deleting car model:', error);
    res.status(400).json({ message: `Failed to delete car model with id: ${id}` });
  }
};

export const getSubmodelById = async (req: Request, res: Response) => {
  const { id, submodelId } = req.params;

  try {
    // Find the model by its ID
    const model = await carModelsCollection.findOne({ _id: new ObjectId(id) });

    if (!model) {
      return res.status(404).json({ message: `Model not found with id: ${id}` });
    }

    // Find the submodel within the model's submodels array by `_id`
    const submodel = model.submodels.find(
      (sub) => sub._id && sub._id.toString() === submodelId
    );

    if (!submodel) {
      return res.status(404).json({ message: `Submodel not found with id: ${submodelId}` });
    }

    res.status(200).json(submodel);
  } catch (error) {
    console.error(`Error fetching submodel with id ${submodelId}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubmodelsByModelId = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    const query = {_id: new ObjectId(id)};
    const model = await carModelsCollection.findOne(query);

    if (model) {
      res.status(200).json(model.submodels);
    } else {
      res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
  } catch (error) {
      console.error(`Error fetching submodels for car model with id ${id}:`, error);
      res.status(400).json({ message: `Invalid car model ID: ${id}` });
      };
  };

export const getModelByName = async (req: Request, res: Response) => {
  const name: string = req.params.name;
  try {
    const query = { name: name };
    const model = (await carModelsCollection.findOne(query)) as Model;

    if (model) {
      res.status(200).json(model);
    } else {
      res.status(404).json({ message: `Car model not found with name: ${name}` });
    }
  } catch (error) {
    console.error(`Error fetching car model with name ${name}:`, error);
    res.status(400).json({ message: `Invalid car model name: ${name}` });
  }
}

export const addSubmodel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const submodel = { ...req.body, _id: new ObjectId() };

  const validateResult = ValidateSubmodel(submodel);

  if (validateResult.error) {
    return res.status(400).json({ message: validateResult.error.message });
  }

  try {
    const result = await carModelsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { submodels: submodel } }
    );

    if (result.modifiedCount > 0) {
      res.status(201).json({ message: 'Submodel added successfully', submodel });
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding submodel', error });
  }
};

export const updateSubmodel = async (req: Request, res: Response) => {
  const { id, submodelId } = req.params;
  const updatedSubmodel = req.body;

  const validateResult = ValidateSubmodel(updatedSubmodel);

  if (validateResult.error) {
    return res.status(400).json({ message: validateResult.error.message });
  }

  try {
    const result = await carModelsCollection.updateOne(
      { _id: new ObjectId(id), 'submodels._id': new ObjectId(submodelId) },
      { $set: { 'submodels.$': { ...updatedSubmodel, _id: new ObjectId(submodelId) } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Submodel updated successfully' });
    } else {
      res.status(404).json({ message: 'Model or submodel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating submodel', error });
  }
};


export const deleteSubmodel = async (req: Request, res: Response) => {
  const { id, submodelId } = req.params;

  try {
    const result = await carModelsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { submodels: { _id: new ObjectId(submodelId) } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Submodel deleted successfully' });
    } else {
      res.status(404).json({ message: 'Model or submodel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting submodel', error });
  }
};

// Like a model
export const likeModel = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  
  try {
    const query = { _id: new ObjectId(id) };
    
    // Check if the model exists
    const model = await carModelsCollection.findOne(query);
    if (!model) {
      return res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
    
    res.status(200).json({ message: 'Model liked successfully' });
  } catch (error) {
    console.error(`Error liking car model with id ${id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unlike a model
export const unlikeModel = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  
  try {
    const query = { _id: new ObjectId(id) };
    
    // Check if the model exists
    const model = await carModelsCollection.findOne(query);
    if (!model) {
      return res.status(404).json({ message: `Car model not found with id: ${id}` });
    }
    
    res.status(200).json({ message: 'Model unliked successfully' });
  } catch (error) {
    console.error(`Error unliking car model with id ${id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get models
export const getMostLikedModels = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    const models = await carModelsCollection
      .find({})
      .limit(limit)
      .toArray();
    
    res.status(200).json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
