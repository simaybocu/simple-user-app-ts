import express from 'express';
import * as userController from '../controllers/userController';
import { API_PORT_PATHS } from '../config/constants';

const router = express.Router();

router.get(API_PORT_PATHS.EMPTY_PATH, userController.getUsers);
router.post(API_PORT_PATHS.ADD_USER_PATH, userController.addUser);
router.get(API_PORT_PATHS.USER_W_ID, userController.getUserByIdEndpoint);
router.put(API_PORT_PATHS.USER_W_ID, userController.updateUser);
router.delete(API_PORT_PATHS.USER_W_ID, userController.deleteUser);

export default router;