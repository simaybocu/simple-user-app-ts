import {Request, Response} from 'express';
import UserService from '../services/userService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS, DATA_TYPE} from '../config/constants';
import {logger} from '../logger/logger';
import {User} from '../models/user';

const userService = new UserService(); //userService classını fonksiyonlarını kullanabilmek için class'ı çağır

export const getUsersEndpoint = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const users = await userService.getUsers();
        
        //user eğer bir array ise her kullanıcı ayrı ayrı listelemek için
        const formattedUsers: User[] = users.flatMap(user => Array.isArray(user) ? user : [user]); //flatMap, her öğe üzerinde bir dönüşüm işlemi gerçekleştirir ve sonuçları tek bir düz liste olarak birleştirir.
        logger.info(`Users successfully listed: ${JSON.stringify(formattedUsers)}`);
        return res.status(HTTP_STATUS.SUCCESS).json({ status: HTTP_STATUS.SUCCESS, count: formattedUsers.length,  data: formattedUsers });
        //TODO: buraya 200 dışında eğer kullanıcı dönmezse 404 not found şeklinde response ekle veya diğer hata kontrolleri eklenecek
    } catch (error) {
        logger.error('Error getting all users:', error);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({status: HTTP_STATUS.SERVER_ERROR, error: ERROR_MESSAGES.COULD_NOT_RETRIEVE_USERS });
    }
};

export const addUserEndpoint = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userData = req.body;

        //tek bir kullanıcı veya kullanıcı dizisi bekler
        if (!Array.isArray(userData) && typeof userData !== DATA_TYPE.OBJECT) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: HTTP_STATUS.BAD_REQUEST, message: ERROR_MESSAGES.INVALID_DATA_FORMAT_FOR_ADD_USER});
        }

        const addUserResponse = await userService.addUser(userData);
        if (typeof addUserResponse === DATA_TYPE.STRING) {
            logger.warn(addUserResponse);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: HTTP_STATUS.BAD_REQUEST, message: addUserResponse });
        }

        logger.info(SUCCESS_MESSAGES.USER_ADDED_SUCCESS);
        return res.status(HTTP_STATUS.SUCCESS).json({ status: HTTP_STATUS.SUCCESS, data: addUserResponse });
    } catch (err) {
        logger.error(`Error adding user: ${(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({ status: HTTP_STATUS.SERVER_ERROR, message: err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR });
    }
};

export const getUserByIdEndpoint = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = parseInt(req.params.id, 10); // ondalık sayı sistemine göre çevrim yapılır
        const user = await userService.getUserById(userId);

        if (user) {
            logger.info(`User found: ${JSON.stringify(user)}`);
            return res.status(HTTP_STATUS.SUCCESS).json({ status:HTTP_STATUS.SUCCESS, data: user});
        } else {
            logger.warn(`User not found for ID: ${userId}`);
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: HTTP_STATUS.NOT_FOUND, message: ERROR_MESSAGES.USER_NOT_FOUND});
        }
    } catch (error) {  
        logger.error(`Error getting user by ID: ${error}`);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({ status: HTTP_STATUS.SERVER_ERROR, error: ERROR_MESSAGES.COULD_NOT_RETRIEVE_USER });
    }
};

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
