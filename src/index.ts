import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';

const app = express();
const port = 3000; //TODO: configden alınacak

app.use(bodyParser.json());
app.use('/users', userRoutes)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})