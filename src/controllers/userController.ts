import {Request, Response} from 'express';
import UserService from '../services/userService';
import { ERROR_MESSAGES, CONSTANTS, SUCCESS_MESSAGES, HTTP_STATUS } from '../config/constants';
import {logger} from '../logger/logger'

const userService = new UserService();

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getUsers();
        const formattedUsers = [];
        for (const user of users) {
            if (Array.isArray(user)) {  //user eğer bir array ise her kullanıcı ayrı ayrı listelemek için
                for (const individualUser of user) {
                    formattedUsers.push({ id: individualUser.id, username: individualUser.username, email: individualUser.email });
                }
            } else {
                formattedUsers.push({ id: user.id, username: user.username, email: user.email });
            }
        }
        res.status(HTTP_STATUS.SUCCESS).json({ status: HTTP_STATUS.SUCCESS, count: formattedUsers.length,  data: formattedUsers });
        logger.info(`Users successfully listed: ${JSON.stringify(formattedUsers)}`);
    } catch (error) {
        logger.error('Error getting all users:', error);
        res.status(500).json({ error: ERROR_MESSAGES.COULD_NOT_RETRIEVE_USERS });
    }
};

export const addUserEndpoint = async (req: Request, res: Response): Promise <Response> => {
    try {
        const addUserResponse = await userService.addUser(req.body);

        if (typeof addUserResponse === CONSTANTS.STRING) {
            logger.warn(addUserResponse);
            return res.status(400).json({status: 400, message: addUserResponse})  //TODO: Hata kodları errorStatus gibi bir sabitin içinden alınacak
        }
        logger.info(SUCCESS_MESSAGES.USER_ADDED_SUCCESS);
        return res.status(200).json({status: 200, data: addUserResponse})
    } catch (err) {
        logger.error(`Error adding user: ${(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
        return res.status(500).json({status: 500, message: err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR});
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

// export const updateUser = (req : Request, res : Response) : void => {
//     const userId = parseInt(req.params.id, 10)
//     const updatedData = req.body;
//     const updatedUser = userService.updateUser(userId, updatedData)

//     if (updatedUser) {
//         res.json(updatedUser);
//     } else {
//         res.status(404).json({error: 'User not found'})
//     }
// }

// export const deleteUser = (req : Request, res : Response) : void => {
//     const userId = parseInt(req.params.id, 10);

//     userService.deleteUser(userId).then((success) => {
//         if (success) {
//             res.json({success: true});
//         } else {
//             res.status(404).json({error: 'User not found'});
//         }
//     }).catch((error) => {
//         console.error('Error deleting user:', error);
//         res.status(500).json({error: 'Internal server error'});
//     });
// };
