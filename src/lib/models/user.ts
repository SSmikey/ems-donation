export interface User {
    _id?: string;
    username: string;
    password?: string;
    role: 'admin' | 'staff';
    firstName: string;
    lastName: string;
    status: 'active' | 'inactive';
    createdAt: string; // ISO 8601 format
}
