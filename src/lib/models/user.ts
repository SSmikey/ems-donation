export interface User {
    _id?: string;
    username: string;
    password?: string;
    role: 'admin' | 'staff';
    firstName: string;
    lastName: string;
    createdAt: Date;
}
