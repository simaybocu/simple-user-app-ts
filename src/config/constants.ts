//TODO: Constants std'larına bakılacak
export const ERROR_MESSAGES = {
    USER_ALREADY_EXISTS: 'User with the same ID already exists.',
    USER_NOT_FOUND: 'User not found.',
    UNKNOWN_ERROR: 'Unknown Error',
    ERROR_OCC_ADD_USER: 'An error occurred while adding a user',
    REDIS_SAVE_FAIL: 'Redis save operation failed',
    COULD_NOT_RETRIEVE_USERS: 'Could not retrieve users'
};

export const SUCCESS_MESSAGES = {
    REDIS_SAVE_SUCCESS: 'Redis save operation successful!',
    USER_ADDED_SUCCESS: "User added succesfully!"
}

export const HTTP_STATUS = {
    SUCCESS: 200,
};

export const API_PORT_PATHS = {
    APP_PORT: 3000,
    USERS_PATH: '/users',
    ADD_USER_PATH: '/add/user',
    EMPTY_PATH: '/'
};

export const CONSTANTS = {
    STRING: 'string'
}

export const CACHING = {
    USERS_CACHE_DURATION: 10000,
  };
