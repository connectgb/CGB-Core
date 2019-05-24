import mongoose from 'mongoose';

const mongodbDatabase = 'ConnectGames';
const dbPass = process.env.DB_PASSWORD; // u25!7KQ6be@D
const connectionUri = `mongodb+srv://discorMiniAdmin:${dbPass}@discordmini-36r5p.gcp.mongodb.net/${mongodbDatabase}?retryWrites=true`;
console.log(connectionUri);
export class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(connectionUri, {
        useNewUrlParser: true,
      })
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(e => {
        // console.log(e);
        console.error('Database connection error');
      });
  }
}
