//import redis from 'redis';
import { promisify } from 'util';
import { createClient } from 'redis';
// import dotenv from 'dotenv'

// if (process.env.NODE_ENV !== 'production') {
//     dotenv.config()
// }
// console.log("REDIS_URL==", process.env.REDIS_URL)
// console.log("REDIS", redis);
// console.log("createClient", redis.createClient);
// const redisUrl = process.env.REDIS_URL; //with port

//const redisClient = redis.createClient({url: redisUrl}); // localhosttan farklı bir değer verilecekse bu şekilde kullanılabilir
const redisClient = createClient() //default olarak local redisi alır

redisClient.on('connect', function () {
    console.log('\x1b[36m', `simple_user_app-redis:`, '\x1b[0m', 'ready');
});

redisClient.on('error', function (err) {
    console.log('\x1b[36m', `simple_user_app-redis:`, '\x1b[0m', 'not connected');
    console.log('Redis Url:' + process.env.REDIS_URL);
    console.log(`Something went wrong  ${err}`);
});

//promisfy ile redis işlemleri asenkron bir işleme dönüştürülür
//buraya farklı işlemlerde eklenebilir delwild, getcacheid işlemleri gibi ihtiyaca göre
const setAsync = promisify(redisClient.set).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);


export const redisUtils = {
    set: setAsync,
    expire: expireAsync,
    del: delAsync,
    getCacheById: getAsync,
};
