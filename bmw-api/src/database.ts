import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { Model } from "./models/carModel";
import { User } from "./models/user";

dotenv.config();
const connectionString : string = process.env.DB_CONN_STRING || "";
const dbName : string = process.env.DB_NAME || "";
const client = new MongoClient(connectionString);

let db : Db
export let carModelsCollection : Collection<Model>
export let usersCollection : Collection<User>
export const collections: { 
  carModels?: Collection<Model>;
  users?: Collection<User>;
} = {};

client.connect().then(() => {
    db = client.db(dbName);
    carModelsCollection = db.collection('bmw_models');
    usersCollection = db.collection('users');
    collections.carModels = carModelsCollection;
    collections.users = usersCollection;
    console.log('Connected to database');
}
)
.catch ((error) =>
{
    if (error instanceof Error) {
        console.log(`issue with db connection ${error.message}`);
    }
    else {
        console.log('error with ${error}');
    }
});
