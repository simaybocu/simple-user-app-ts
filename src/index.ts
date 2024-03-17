import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import {logger} from '../src/logger/logger'
import { API_PORT_PATHS } from './config/constants';

const app = express();
const port = API_PORT_PATHS.APP_PORT;

app.use(bodyParser.json());
app.use(API_PORT_PATHS.USERS_PATH, userRoutes)

app.listen(port, () => {
  logger.info(`Server is listening at http://localhost:${port}`);
})