import User from '../models/user';
import Redis from 'ioredis'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

const redis = new Redis()


export default class UserService {
    constructor() {}

    // Tüm kullanıcıları almak için
    async getUsers(): Promise < User[] > {
        try {
            const usersData = await redis.get('users');
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    // Yeni bir kullanıcı ekle
    async addUser(user : User): Promise<User[] | string | Error> {
        try {
            const users = await this.getUsers();
            const existingUser = users.find(existingUser => existingUser.id === user.id); //find metodunda eşleşme olursa true döner, eşleşme bulunmazsa undefined döner

            if (existingUser) { // Kullanıcı zaten varsa, bir hata mesajı döndür.
                return ERROR_MESSAGES.USER_ALREADY_EXISTS
            }
            //TODO: daha farklı hata kontrolleri eklenebilir.

            //mevcut kullanıcı dizisine yeni bir kullanıcı eklenir
            const updatedUsers = [...users, user];  //TODO: Kullanıcı eklendikten sonra sadece o kullanıcıyı dön response olarak. O kullanıcının listedeki kaçıncı kullanıcı olduğunu belirten bir şey de dön.

            //TODO: Redis hata yakalama iyileştirilecek
            try { 
              await redis.set('users', JSON.stringify(updatedUsers)); //TODO: key kısmı için araştırma, iyileştirme. Redis işlemlerini fonksiyona alma
              console.log(SUCCESS_MESSAGES.REDIS_SAVE_SUCCESS); //TODO: loggerlanacak
            } catch (redisError) {
              console.error(ERROR_MESSAGES.REDIS_SAVE_FAIL, redisError); //TODO: logger
              return ERROR_MESSAGES.REDIS_SAVE_FAIL;
          }
            return updatedUsers; //Başarılı olduğunda kullanıcıları döndür.
        } catch (error) {
            console.error('Error adding user:', (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR)); //TODO: logger
            throw new Error('Kullanıcı ekleme işlemi başarısız. Hata: ' + (error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR));
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
    updateUser(userId : number, updatedData : Partial < User >): Promise < User | null > {
        return this.getUsers().then((users) => {
            if (users) {
                const updatedUsers = users.map((user) => {
                    if (user.id === userId) {
                        return {
                            ...user,
                            ...updatedData
                        };
                    }
                    return user;
                });
                return redis.set('users', JSON.stringify(updatedUsers)).then(() => updatedUsers.find((user) => user.id === userId) || null);
            }
            return null;
        });
    }

    deleteUser(userId : number): Promise < boolean > {
        return this.getUsers().then((users) => {
            if (users) {
                const filteredUsers = users.filter((user) => user.id !== userId);
                return redis.set('users', JSON.stringify(filteredUsers)).then(() => filteredUsers.length !== users.length)
            }
            return false
        })
    }
}
