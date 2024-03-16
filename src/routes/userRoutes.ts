import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.post('/add/user', userController.addUserEndpoint);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;