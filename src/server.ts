import express from 'express';

const app = express();
const port = process.env.PORT || 8080; // default port to listen

// define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('Connect Games Website! Yep this is the right place!');
});

//     start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
