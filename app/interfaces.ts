
export interface User {
    username: string;
    pass: string;
    session: string;
    authType: string;
}

export interface ValidationResult {
    [key: string]: boolean;
}
