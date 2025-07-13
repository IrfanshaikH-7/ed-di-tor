import 'dotenv/config';
import express from 'express';
import promptRouter from './routes/prompt';

const app = express();
app.use(express.json());

app.use('/prompt', promptRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 