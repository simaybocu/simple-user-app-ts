import {Request, Response} from 'express';
import UserService from '../services/userService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS, DATA_TYPE} from '../config/constants';
import {logger} from '../logger/logger';
import {User} from '../models/user';

const userService = new UserService();

/**
 * Handles the request to retrieve all users.
 * 
 * @param {Request} _req - The Express request object (not used).
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response>} - The response with status and user data or error message.
 */
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const users = await userService.getUsers();
        if (users.length === 0) {
            logger.warn(ERROR_MESSAGES.NO_USERS_FOUND);
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: ERROR_MESSAGES.NO_USERS_FOUND
            });
        }
        // If the user is an array, list each user separately
        const formattedUsers: User[] = users.flatMap(user => Array.isArray(user) ? user : [user]);  // flatMap applies a transformation to each element and combines the results into a single flat list.
        logger.info(`Users successfully listed: ${JSON.stringify(formattedUsers)}`);

        return res.status(HTTP_STATUS.SUCCESS).json({
            status: HTTP_STATUS.SUCCESS,
            count: formattedUsers.length,
            data: formattedUsers
        });
    } catch (error) {
        logger.error('Error getting all users:', error);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({
            status: HTTP_STATUS.SERVER_ERROR,
            message: ERROR_MESSAGES.COULD_NOT_RETRIEVE_USERS
        })
    }
};

/**
 * Endpoint to add a user or a list of users.
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns Response with the status and result of the add operation.
 */
export const addUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userData = req.body;
        
        // Expecting either a single user object or an array of users
        if (!Array.isArray(userData) && typeof userData !== DATA_TYPE.OBJECT) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                status: HTTP_STATUS.BAD_REQUEST, 
                message: ERROR_MESSAGES.INVALID_DATA_FORMAT_FOR_ADD_USER 
            });
        }

        const addUserResponse = await userService.addUser(userData);
        if (typeof addUserResponse === DATA_TYPE.STRING) {
            logger.warn(addUserResponse);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                status: HTTP_STATUS.BAD_REQUEST, 
                message: addUserResponse 
            });
        }
        logger.info(SUCCESS_MESSAGES.USER_ADDED_SUCCESS);
        return res.status(HTTP_STATUS.SUCCESS).json({ 
            status: HTTP_STATUS.SUCCESS, 
            data: addUserResponse 
        });
    } catch (err) {
        logger.error(`Error adding user: ${(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({ status: HTTP_STATUS.SERVER_ERROR, message: err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR });
    }
};

/**
 * Endpoint to get a user by ID.
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns Response with the status and user data or error message.
 */
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = parseInt(req.params.id, 10); // Convert to decimal number
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

/**
 * Endpoint to update a user by ID.
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns Response with the status and updated user data or error message.
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = parseInt(req.params.id, 10);
    const updatedData = req.body;

    try {
        const updateUserResponse = await userService.updateUser(userId, updatedData);
        let statusCode = HTTP_STATUS.SUCCESS;

        if (typeof updateUserResponse === DATA_TYPE.STRING) {
            statusCode = updateUserResponse === ERROR_MESSAGES.USER_NOT_FOUND ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.SERVER_ERROR;
        }

        return res.status(statusCode).json({
            status: statusCode,
            data: typeof updateUserResponse === DATA_TYPE.STRING ? null : updateUserResponse,
            message: typeof updateUserResponse === DATA_TYPE.STRING ? updateUserResponse : SUCCESS_MESSAGES.USER_UPDATED_SUCCESS
        });
    } catch (err) {
        logger.error(`Error updating user: ${err}`);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({
            status: HTTP_STATUS.SERVER_ERROR,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Endpoint to delete a user by ID.
 * @param req - Express request object containing the user ID in the URL parameters.
 * @param res - Express response object.
 * @returns A JSON response with the status, success flag, and message.
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = parseInt(req.params.id, 10);

    try {
        const deleteUserResponse = await userService.deleteUser(userId);
        let statusCode = HTTP_STATUS.SUCCESS; // Default success status code

        if (typeof deleteUserResponse === DATA_TYPE.STRING) {
            statusCode = deleteUserResponse === ERROR_MESSAGES.USER_NOT_FOUND ? 404 : 500;
        }

        return res.status(statusCode).json({
            status: statusCode,
            success: typeof deleteUserResponse === DATA_TYPE.BOOLEAN ? deleteUserResponse : false,
            message: typeof deleteUserResponse === DATA_TYPE.STRING ? deleteUserResponse : SUCCESS_MESSAGES.USER_DELETED_SUCCESS
        });
    } catch (err) {
        logger.error(`Error deleting user: ${err}`);
        return res.status(HTTP_STATUS.SERVER_ERROR).json({
            status: HTTP_STATUS.SERVER_ERROR,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};


