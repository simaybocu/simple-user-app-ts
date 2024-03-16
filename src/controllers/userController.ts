import {Request, Response} from 'express';
import UserService from '../services/userService';
import { ERROR_MESSAGES } from '../config/constants';

const userService = new UserService();

export const addUserEndpoint = async (req : Request, res : Response) : Promise < Response > => {
    try {
        const addUserResponse = await userService.addUser(req.body);

        if (typeof addUserResponse === 'string') {
            return res.status(400).json({status: 400, message: addUserResponse})  //TODO: Hata kodları errorStatus gibi bir sabitin içinden alınacak
        }
        return res.status(200).json({status: 200, data: addUserResponse})
    } catch (err) {
        console.error('Error adding user:', (err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)); // TODO: logger
        let errorMessage = ERROR_MESSAGES.ERROR_OCC_ADD_USER;

        if (err instanceof Error) {
            errorMessage += ': ' + err.message;
        }
        return res.status(500).json({status: 500, message: errorMessage});
    }
};


export const getAllUsers = async (_req : Request, res : Response) : Promise < void > => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({error: 'Could not retrieve users'});
    }
};

export const getUserById = (req : Request, res : Response) : void => {
    const userId = parseInt(req.params.id, 10); // ondalık sayı sistemine göre çevrim yapılır.
    const user = userService.getUserById(userId)

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({error: 'User not found'})
    }
}

export const updateUser = (req : Request, res : Response) : void => {
    const userId = parseInt(req.params.id, 10)
    const updatedData = req.body;
    const updatedUser = userService.updateUser(userId, updatedData)

    if (updatedUser) {
        res.json(updatedUser);
    } else {
        res.status(404).json({error: 'User not found'})
    }
}

export const deleteUser = (req : Request, res : Response) : void => {
    const userId = parseInt(req.params.id, 10);

    userService.deleteUser(userId).then((success) => {
        if (success) {
            res.json({success: true});
        } else {
            res.status(404).json({error: 'User not found'});
        }
    }).catch((error) => {
        console.error('Error deleting user:', error);
        res.status(500).json({error: 'Internal server error'});
    });
};
