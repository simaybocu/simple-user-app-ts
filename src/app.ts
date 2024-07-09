import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import {logger} from './logger/logger'
import { API_PORT_PATHS } from './config/constants';

const app = express();

app.use(bodyParser.json());
app.use(API_PORT_PATHS.USERS_PATH, userRoutes)

app.listen(API_PORT_PATHS.APP_PORT, () => {
  logger.info(`Server is listening at ${API_PORT_PATHS.APP_PORT}`);
})