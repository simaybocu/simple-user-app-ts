import {User} from '../models/user';
import {CACHING, ERROR_MESSAGES, SUCCESS_MESSAGES} from '../config/constants';
import {logger} from '../logger/logger';
import { getValue, setJson } from '../cache/query';
import {Key} from '../cache/keys'


export default class UserService {
    constructor() {}

    // Tüm kullanıcıları listeler
    async getUsers():Promise <User[]> {
        try {
            const usersData = await getValue(Key.USERS); //redisten USERS key'i altındaki tüm kullanıcıları alır
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            logger.error(`Error getting users: ${error}`);
            throw error;
        }
    }

    async addUser(user: User | User[]): Promise<{ usercount: number, users: User[] } | string> {
        try {
            const users = await this.getUsers();
            const userList = Array.isArray(user) ? user : [user]; // eğer user dizi ise direkt user'ı kullanır değilse user'ı bir dizi içerisine alır. Ki tek bir formata göre işlem yapmak için
    
            const existingUsers = userList.filter(newUser => users.find(existingUser => existingUser.id === newUser.id)); //find metodunda eşleşme olursa true döner, eşleşme bulunmazsa undefined döner, filter methodu bir dizi döndürür
            if (existingUsers.length > 0) {  // Kullanıcı zaten varsa, bir hata mesajı döndür.
                return ERROR_MESSAGES.USER_ALREADY_EXISTS;
            }
    
            const newUsersCount = userList.length;
            //const totalUsersCount = users.length + newUsersCount; // mevcutta toplam tüm kullanıcı sayısı
    
            try {
                const updatedUsers = [...users, ...userList]; //users ve userList birleştirerek yeni bir dizi oluşturur çünkü eklenen tüm kullanıcıları redis'e kaydetmek için
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

    // Belirli bir kullanıcı ID'sine sahip kullanıcıyı almak için
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
