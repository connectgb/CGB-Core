import express from 'express';
export class Server {
  app = express();
  port = 8080; // default port to listen

  // define a route handler for the default home page

  constructor() {
    this.app.get('/', (req, res) => {
      res.send('Connect Games Website! Yep this is the right place!');
    });
    // start the Express server
    this.app.listen(this.port, () => {
      console.log(`server started at http://localhost:${this.port}`);
    });
  }
}
