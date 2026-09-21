// Load environment variables
// require('dotenv').config();
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to MindCare!');
});
app.get('/login', (req, res) => {
  res.send('Welcome to MindCare Login!');
});
app.listen(process.env.PORT || 3000, () => {
  console.log(`MindCare app Running at http://localhost:${process.env.PORT}`);
});