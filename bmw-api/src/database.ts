import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { Model } from "./models/carModel";
import { User } from "./models/user";

dotenv.config();

const connectionString: string = process.env.NODE_ENV === 'production'
  ? `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.slwap.mongodb.net/Web2_2024?retryWrites=true&w=majority`
  : process.env.DB_CONN_STRING || "";

const dbName: string = process.env.DB_NAME || "Web2_2024";
const client = new MongoClient(connectionString);

let db: Db;
export let carModelsCollection: Collection<Model>;
export let usersCollection: Collection<User>;
export const collections: { 
  carModels?: Collection<Model>;
  users?: Collection<User>;
} = {};

client.connect()
  .then(() => {
    db = client.db(dbName);
    carModelsCollection = db.collection('bmw_models');
    usersCollection = db.collection('users');
    collections.carModels = carModelsCollection;
    collections.users = usersCollection;
    console.log('Connected to database:', process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local MongoDB');
  })
  .catch((error) => {
    if (error instanceof Error) {
      console.error(`Database connection error: ${error.message}`);
    } else {
      console.error('Unknown database error:', error);
    }
  });
