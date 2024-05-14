import {User} from '../models/user';
import {CACHING, ERROR_MESSAGES, SUCCESS_MESSAGES} from '../config/constants';
import {logger} from '../logger/logger';
import { getValue, setJson, incr } from '../cache/query';
import {Key} from '../cache/keys'


export default class UserService {
    constructor() {}

    // Tüm kullanıcıları listeler
    async getUsers(): Promise <User[]> {
        try {
            const usersData = await getValue(Key.USERS);
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            logger.error(`Error getting users: ${error}`);
            throw error;
        }
    }

    // Yeni bir kullanıcı ekle
    async addUser(user: User): Promise < {usernumber: number, user: User} | string > {
        try {
            const users = await this.getUsers();

            const existingUser = users.find(existingUser => existingUser.id === user.id); //find metodunda eşleşme olursa true döner, eşleşme bulunmazsa undefined döner
            if (existingUser) { // Kullanıcı zaten varsa, bir hata mesajı döndür.
                return ERROR_MESSAGES.USER_ALREADY_EXISTS
            }

            const usernumber = await incr(Key.USER_NUMBER);// otomatik artan anahtar

            try { 
                await setJson(Key.USERS, [...users, user] , CACHING.USERS_CACHE_DURATION); //TODO: cacheden bir gün sonra silinmesi lazım ms o şekilde upd edilecek.
                logger.info(SUCCESS_MESSAGES.REDIS_SAVE_SUCCESS);
            } catch (redisError) {
                return ERROR_MESSAGES.REDIS_SAVE_FAIL;
            }
            return {usernumber, user}  //TODO: array içinde birden fazla gönderildiyse onları ayrı data olarak sayması lazım, test
        } catch (error) {
            logger.error(`Error adding user: ${(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)}`);
            throw new Error('Adding user failed. Error: ' + (
            error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
        ));
        }
    }

    // Belirli bir kullanıcı ID'sine sahip kullanıcıyı almak için
    getUserById(userId : number): Promise < User | null > {
        return this.getUsers().then((users) => {
            if (users) {
                return users.find((user) => user.id === userId) || null;
            }
            return null;
        })
    }

    // Belirli bir kullanıcı ID'sine sahip kullanıcının bilgilerini güncellemek için.
    // updatedData parametresi, güncellenmiş verilerin bir kısmını içerebilir.
    // updateUser(userId : number, updatedData : Partial < User >): Promise < User | null > {
    //     return this.getUsers().then((users) => {
    //         if (users) {
    //             const updatedUsers = users.map((user) => {
    //                 if (user.id === userId) {
    //                     return {
    //                         ...user,
    //                         ...updatedData
    //                     };
    //                 }
    //                 return user;
    //             });
    //             return setAsync('users', JSON.stringify(updatedUsers)).then(() => updatedUsers.find((user) => user.id === userId) || null);
    //         }
    //         return null;
    //     });
    // }

    // deleteUser(userId : number): Promise < boolean > {
    //     return this.getUsers().then((users) => {
    //         if (users) {
    //             const filteredUsers = users.filter((user) => user.id !== userId);
    //             return setAsync('users', JSON.stringify(filteredUsers)).then(() => filteredUsers.length !== users.length)
    //         }
    //         return false
    //     })
    // }
}
