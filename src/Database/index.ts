import mongoose from 'mongoose';

// console.log(connectionUri);
export class Database {
  mongodbDatabase =
    process.env.PRODUCTION === 'True'
      ? 'ConnectGames'
      : 'ConnectGames-Developer';
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(
        `mongodb+srv://discorMiniAdmin:${
          process.env.DB_PASSWORD
        }@discordmini-36r5p.gcp.mongodb.net/${
          this.mongodbDatabase
        }?retryWrites=true`,
        {
          useFindAndModify: false,
          useNewUrlParser: true,
        }
      )
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(e => {
        // console.log(e);
        console.error('Database connection error');
      });
  }
}
