export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

export function getToken() {
    return localStorage.getItem('token');
}

export function axiosError(message, cb) {
    return error => {
        if (error.response) {
            if (error.response.cause) {
                console.error(error.response.cause);
            }
            if (error.response.data) {
                console.error(error.response.data.message);
            }
        }
        if (cb) {
            cb(message);
        }
    }
}
