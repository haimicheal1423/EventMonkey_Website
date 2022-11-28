export function isLoggedIn(){
    return localStorage.getItem('token') ?  true :false;
}

export function getToken(){
    return localStorage.getItem('token') ?  localStorage.getItem('token') :null;
}
