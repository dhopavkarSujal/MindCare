require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to MindCare!');
});
app.get('/login', (req, res) => {
  res.send('Welcome to MindCare Login!');
});
app.listen(process.env.PORT, () => {
  console.log(`MindCare app Running at http://localhost:${process.env.PORT}`);
});