import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { UserRole } from '../models/auth';
import { AuthSessionService } from '../services/auth-session.service';

const ROLE_ROUTE_PREFIXES: Record<UserRole, string[]> = {
    ADMIN: ['/admin'],
    TEACHER: ['/admin/student-grades', '/admin/teacher-attendance', '/admin/kardex', '/admin'],
    STUDENT: ['/admin/registration', '/admin/payment', '/admin/kardex', '/admin'],
    PARENT: ['/admin/parent', '/admin'],
    UNKNOWN: []
};

export const roleGuard: CanActivateChildFn = (_route, state) => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);

    const role = authSession.currentRole;
    const currentUrl = state.url || '/admin';

    if (role === 'ADMIN') {
        return true;
    }

    const allowedPrefixes = ROLE_ROUTE_PREFIXES[role] || [];
    const hasAccess = allowedPrefixes.some((prefix) => currentUrl.startsWith(prefix));

    if (hasAccess) {
        return true;
    }

    return router.createUrlTree(['/forbidden'], {
        queryParams: {
            route: currentUrl
        }
    });
};
