export interface AuthUser {
    id: string;
    name: string;
    lastname: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    expiresAt: string;
    user: AuthUser;
}

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'UNKNOWN';
