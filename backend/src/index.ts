import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import promptRouter from './routes/prompt';
import executeRouter from './routes/execute';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/prompt', promptRouter);
app.use('/exec', executeRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 