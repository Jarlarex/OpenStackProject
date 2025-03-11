import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const uri : string = process.env.DB_CONN_STRING || "";
const dbName : string = process.env.DB_NAME || "";
const collectionName = 'bmw_models';

const addSubmodelIds = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const models = await collection.find({}).toArray();

    for (const model of models) {
      const updatedSubmodels = (model.submodels || []).map((submodel: any) => ({
        ...submodel,
        _id: submodel._id || new ObjectId(),
      }));

      await collection.updateOne(
        { _id: model._id },
        { $set: { submodels: updatedSubmodels } }
      );
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
  }
};

addSubmodelIds();
