export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

export function getToken() {
    return localStorage.getItem('token');
}

export function getUser() {
    const string = localStorage.getItem('user');
    if (string === null) {
        return null;
    }
    return JSON.parse(string);
}

export function isUserOrganizer() {
    if (!isLoggedIn()) {
        return false;
    }
    const user = getUser();
    if (user === null) {
        return false;
    }
    return user.type.toUpperCase() === 'ORGANIZER';
}

export function isUserAttendee() {
    if (!isLoggedIn()) {
        return false;
    }
    const user = getUser();
    if (user === null) {
        return false;
    }
    return user.type.toUpperCase() === 'ATTENDEE';
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
