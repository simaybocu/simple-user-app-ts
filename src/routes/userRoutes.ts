import express from 'express';
import * as userController from '../controllers/userController';
import { API_PORT_PATHS } from '../config/constants';

const router = express.Router();

router.get(API_PORT_PATHS.EMPTY_PATH, userController.getAllUsers);
router.post(API_PORT_PATHS.ADD_USER_PATH, userController.addUserEndpoint);
router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

export default router;