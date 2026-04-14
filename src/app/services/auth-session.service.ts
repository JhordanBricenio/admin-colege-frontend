import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { AuthResponse, AuthUser, UserRole } from '../models/auth';

interface StoredAuthSession {
    accessToken: string;
    expiresAt: string;
    user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
    private readonly SESSION_KEY = 'auth_session';
    private readonly ACCESS_TOKEN_KEY = 'accessToken';

    private readonly sessionSubject = new BehaviorSubject<StoredAuthSession | null>(null);
    readonly session$ = this.sessionSubject.asObservable();

    constructor(@Inject(PLATFORM_ID) private platformId: object) {
        this.restoreSession();
    }

    get currentSession(): StoredAuthSession | null {
        return this.sessionSubject.value;
    }

    get accessToken(): string | null {
        return this.currentSession?.accessToken ?? null;
    }

    get isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    get currentRole(): UserRole {
        return this.normalizeRole(this.currentSession?.user?.role);
    }

    get currentUser(): AuthUser | null {
        return this.currentSession?.user ?? null;
    }

    setSessionFromAuthResponse(response: AuthResponse): void {
        const session: StoredAuthSession = {
            accessToken: response.accessToken,
            expiresAt: response.expiresAt,
            user: response.user
        };

        this.sessionSubject.next(session);

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    }

    clearSession(): void {
        this.sessionSubject.next(null);

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }

    hasAnyRole(allowedRoles: UserRole[]): boolean {
        const role = this.currentRole;
        if (role === 'ADMIN') {
            return true;
        }

        return allowedRoles.includes(role);
    }

    private restoreSession(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const rawSession = localStorage.getItem(this.SESSION_KEY);
        if (rawSession) {
            try {
                const parsed = JSON.parse(rawSession) as StoredAuthSession;
                this.sessionSubject.next(parsed);
                return;
            } catch {
                localStorage.removeItem(this.SESSION_KEY);
            }
        }

        const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        if (!accessToken) {
            return;
        }

        const tokenRole = this.readRoleFromToken(accessToken);
        if (!tokenRole) {
            return;
        }

        this.sessionSubject.next({
            accessToken,
            expiresAt: '',
            user: {
                id: '',
                name: '',
                lastname: '',
                email: '',
                role: tokenRole
            }
        });
    }

    private normalizeRole(role?: string | null): UserRole {
        const normalized = (role || '').trim().toUpperCase();

        if (normalized.includes('ADMIN')) {
            return 'ADMIN';
        }

        if (normalized.includes('DOCENTE') || normalized.includes('TEACHER')) {
            return 'TEACHER';
        }

        if (normalized.includes('ESTUDIANTE') || normalized.includes('STUDENT')) {
            return 'STUDENT';
        }

        return 'UNKNOWN';
    }

    private readRoleFromToken(token: string): string | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));

            return payload?.role ?? null;
        } catch {
            return null;
        }
    }
}
