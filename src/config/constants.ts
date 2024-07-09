//TODO: Constants std'larına bakılacak
export const ERROR_MESSAGES = {
    USER_ALREADY_EXISTS: 'User with the same ID already exists.',
    USER_NOT_FOUND: 'User not found.',
    UNKNOWN_ERROR: 'Unknown Error',
    ERROR_OCC_ADD_USER: 'An error occurred while adding a user',
    REDIS_SAVE_FAIL: 'Redis save operation failed',
    COULD_NOT_RETRIEVE_USERS: 'Could not retrieve users',
    INVALID_DATA_FORMAT_FOR_ADD_USER: 'Invalid data format. Expecting a user object or a sequence of user objects.',
    COULD_NOT_RETRIEVE_USER: 'Could not retrieve user with this id',
    NO_USERS_FOUND: 'No users found'
};

export const SUCCESS_MESSAGES = {
    REDIS_SAVE_SUCCESS: 'Redis save operation successful!',
    USER_ADDED_SUCCESS: "User added succesfully!"
}

export const HTTP_STATUS = {
    SUCCESS: 200,
    SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

export const API_PORT_PATHS = {
    APP_PORT: 3000,
    USERS_PATH: '/users',
    ADD_USER_PATH: '/add/user',
    USER_W_ID: '/:id',
    EMPTY_PATH: '/'
};

export const CONSTANTS = {
    
}

export const DATA_TYPE = {
    STRING: 'string',
    OBJECT: 'object'
}

export const CACHING = {
    USERS_CACHE_DURATION: 86400000, //ms cinsinden bir gün sonra
  };
