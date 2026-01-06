/**
 * Authentication middleware utilities
 * Simple session-based authentication for EMS Donation System
 */

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export interface AuthUser {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'staff';
}

/**
 * Get user from session/headers
 * For now, this is a simple implementation that can be enhanced later
 * 
 * @param request - Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function getUserFromRequest(request: NextRequest | Request): Promise<AuthUser | null> {
    try {
        // Check for user info in headers (set by frontend after login)
        const userHeader = request.headers.get('x-user-info');

        if (userHeader) {
            const user = JSON.parse(userHeader);
            return {
                _id: user._id || user.userId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            };
        }

        // TODO: Implement proper session management with cookies/JWT
        // For now, return null if no user header
        return null;
    } catch (error) {
        console.error('Error getting user from request:', error);
        return null;
    }
}

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 * 
 * @param request - Next.js request object
 * @returns User object if authenticated, NextResponse with 401 if not
 */
export async function requireAuth(request: NextRequest | Request): Promise<AuthUser | NextResponse> {
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({
            error: 'Authentication required',
            details: 'Please login to access this resource'
        }, { status: 401 });
    }

    return user;
}

/**
 * Require admin role middleware
 * Returns 403 if user is not an admin
 * 
 * @param request - Next.js request object
 * @returns User object if admin, NextResponse with 401/403 if not
 */
export async function requireAdmin(request: NextRequest | Request): Promise<AuthUser | NextResponse> {
    const userOrResponse = await requireAuth(request);

    // If it's a NextResponse (error), return it
    if (userOrResponse instanceof NextResponse) {
        return userOrResponse;
    }

    const user = userOrResponse as AuthUser;

    if (user.role !== 'admin') {
        return NextResponse.json({
            error: 'Forbidden',
            details: 'Admin access required'
        }, { status: 403 });
    }

    return user;
}

/**
 * Create user info object for API responses
 * Removes sensitive data like password
 * 
 * @param user - User object from database
 * @returns Safe user object for API responses
 */
export function createUserInfo(user: any): AuthUser {
    return {
        _id: user._id.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    };
}

/**
 * Create user object for distribution requests
 * 
 * @param user - AuthUser object
 * @returns User object formatted for distribution requests
 */
export function createRequestUserObject(user: AuthUser) {
    return {
        userId: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    };
}

/**
 * Create approval user object
 * 
 * @param user - AuthUser object
 * @returns User object formatted for approvals with timestamp
 */
export function createApprovalUserObject(user: AuthUser) {
    return {
        userId: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        approvedAt: new Date().toISOString()
    };
}
