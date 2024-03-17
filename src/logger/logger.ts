import pino from 'pino'

export const logger = pino({
    name: 'app',
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
        }
    }
});
logger.trace('Some trace log')