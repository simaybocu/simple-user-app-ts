import express from 'express';
import * as userController from '../controllers/userController';
import { API_PORT_PATHS } from '../config/constants';

const router = express.Router();

router.get(API_PORT_PATHS.EMPTY_PATH, userController.getUsersEndpoint);
router.post(API_PORT_PATHS.ADD_USER_PATH, userController.addUserEndpoint);
router.get(API_PORT_PATHS.GET_USER_W_ID, userController.getUserByIdEndpoint);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

export default router;