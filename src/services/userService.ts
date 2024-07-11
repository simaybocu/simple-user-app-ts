import {User} from '../models/user';
import {CACHING, ERROR_MESSAGES, SUCCESS_MESSAGES} from '../config/constants';
import {logger} from '../logger/logger';
import { getValue, setJson, delByKey } from '../cache/query';
import {Key} from '../cache/keys'


export default class UserService {
    constructor() {}

    /**
     * Retrieves all users from the Redis cache.
     * 
     * @returns {Promise<User[]>} - An array of User objects.
     * @throws {Error} - If retrieval fails.
     */
    async getUsers():Promise <User[]> {
        try {
            const usersData = await getValue(Key.USERS); // Retrieve all users under the USERS key in Redis
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            logger.error(`Error getting users: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new Error(ERROR_MESSAGES.COULD_NOT_RETRIEVE_USERS);
        }
    }

    /**
     * Service function to add a user or a list of users.
     * @param user - Single user object or an array of users.
     * @returns Result of the add operation: number of new users and the list of new users, or an error message.
     */
    async addUser(user: User | User[]): Promise<{ usercount: number, users: User[] } | string> {
        try {
            const users = await this.getUsers();
            const userList = Array.isArray(user) ? user : [user]; // Use user directly if it is an array, otherwise wrap it in an array for uniform processing
    
            // Filter for existing users by matching IDs
            const existingUsers = userList.filter(newUser => users.find(existingUser => existingUser.id === newUser.id));
            if (existingUsers.length > 0) {
                return ERROR_MESSAGES.USER_ALREADY_EXISTS;
            }
    
            const newUsersCount = userList.length;
    
            try {
                // Combine users and userList to form a new array for saving to Redis
                const updatedUsers = [...users, ...userList];
                await setJson(Key.USERS, updatedUsers, CACHING.USERS_CACHE_DURATION);
                logger.info(SUCCESS_MESSAGES.REDIS_SAVE_SUCCESS);
            } catch (redisError) {
                return ERROR_MESSAGES.REDIS_SAVE_FAIL;
            }
            return { usercount: newUsersCount, users: userList };
        } catch (error) {
            logger.error(`Error adding user: ${(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
            throw new Error('Adding user failed. Error: ' + (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR));
        }
    }

    /**
     * Service function to get a user by ID.
     * @param userId - The ID of the user to retrieve.
     * @returns The user object if found, or null if not found.
     */
    async getUserById(userId: number): Promise<User | null> {
        try {
            const users = await this.getUsers();
            const user = users.find((user) => user.id === userId) || null;
            return user;
        } catch (error) {
            logger.error(`Error getting user by ID: ${error}`);
            throw error;
        }
    }

    /**
     * Service function to update a user's information.
     * @param userId - The ID of the user to update.
     * @param updatedData - The new data to update the user with.
     * @returns The updated user object if successful, or an error message if not.
     */
    async updateUser(userId: number, updatedData: Partial<User>): Promise<User | string> {
        try {
            const users = await this.getUsers();
            if (users) {
                // Map through the users array and update the user with the matching ID.
                // If the user's ID matches userId, merge the updatedData into the user object.
                // Otherwise, return the user object unchanged.
                const updatedUsers = users.map(user => {
                    if (user.id === userId) {
                        return { ...user, ...updatedData };
                    }
                    return user;
                });
    
                const userToUpdate = updatedUsers.find(user => user.id === userId);
                if (!userToUpdate) {
                    return ERROR_MESSAGES.USER_NOT_FOUND;
                }
    
                try {
                    await setJson(Key.USERS, updatedUsers, CACHING.USERS_CACHE_DURATION);
                    logger.info(SUCCESS_MESSAGES.REDIS_SAVE_SUCCESS);
                } catch (redisError) {
                    return ERROR_MESSAGES.REDIS_SAVE_FAIL; // Redis save error
                }
    
                return userToUpdate; // Return updated user if successful
            }
            return ERROR_MESSAGES.USER_NOT_FOUND; // Return error if users could not be retrieved
        } catch (error) {
            logger.error(`Error updating user: ${(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
            throw new Error('Updating user failed. Error: ' + (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR));
        }
    }
    
    /**
     * Service function to delete a user by ID.
     * @param userId - The ID of the user to delete.
     * @returns A boolean indicating success, or an error message if not.
     */
    async deleteUser(userId: number): Promise<boolean | string> {
        try {
            const users = await this.getUsers();
            if (users) {
                // Filter out the user to be deleted
                const filteredUsers = users.filter(user => user.id !== userId);
    
                if (filteredUsers.length === users.length) {
                    return ERROR_MESSAGES.USER_NOT_FOUND;
                }
    
                try {
                    // Remove the deleted user from Redis
                    await delByKey(`user:${userId}`);
                    // Save the updated users list to Redis
                    await setJson(Key.USERS, filteredUsers, CACHING.USERS_CACHE_DURATION);
                    logger.info(SUCCESS_MESSAGES.REDIS_SAVE_SUCCESS);
                } catch (redisError) {
                    logger.error(`Error saving to Redis: ${redisError}`);
                    return ERROR_MESSAGES.REDIS_SAVE_FAIL; // Redis save error
                }
    
                return true;
            }
            return ERROR_MESSAGES.USER_NOT_FOUND;
        } catch (error) {
            logger.error(`Error deleting user: ${error}`);
            return ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }
}
