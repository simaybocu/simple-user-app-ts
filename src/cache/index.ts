import {createClient} from 'redis'
import {logger} from '../logger/logger'

const client = createClient()

client.on('connect', () => logger.info('Cache is connecting'));
client.on('ready', () => logger.info('Cache is ready'));
client.on('end', () => logger.info('Cache disconnected'));
client.on('reconnecting', () => logger.info('Cache is reconnecting'));
client.on('error', (e) => logger.error(e));

(async () => {
  await client.connect();
})();

//If the Node process ends, close the Cache connection
process.on('SIGINT', async () => {
  await client.disconnect();
})

export default client;