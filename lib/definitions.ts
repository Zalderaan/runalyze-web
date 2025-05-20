export interface LoginUser {
    email: string,
    password: string
}

export interface RegisterUser {
    username: string,
    email: string,
    password: string,
}

export interface User {
    id: number,
    username: string
    email: string,
    password: string,
}