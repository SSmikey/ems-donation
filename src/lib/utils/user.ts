/**
 * User validation and helper utilities
 */

export interface UserInfo {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface ApprovalUserInfo extends UserInfo {
    approvedAt: string; // ISO 8601 timestamp
}

/**
 * Validates that a user object has all required fields
 * 
 * @param user - The user object to validate
 * @param fieldName - Name of the field being validated (for error messages)
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUserObject(user: any, fieldName: string = 'user'): string[] {
    const errors: string[] = [];

    if (!user || typeof user !== 'object') {
        errors.push(`${fieldName} is required and must be an object`);
        return errors;
    }

    const requiredFields: (keyof UserInfo)[] = ['userId', 'username', 'firstName', 'lastName', 'role'];

    for (const field of requiredFields) {
        if (!user[field] || typeof user[field] !== 'string' || user[field].trim() === '') {
            errors.push(`${fieldName}.${field} is required and must be a non-empty string`);
        }
    }

    return errors;
}

/**
 * Validates an approval user object (includes approvedAt timestamp)
 * 
 * @param user - The approval user object to validate
 * @param fieldName - Name of the field being validated (for error messages)
 * @returns Array of validation error messages (empty if valid)
 */
export function validateApprovalUserObject(user: any, fieldName: string = 'approvedBy'): string[] {
    const errors = validateUserObject(user, fieldName);

    if (errors.length > 0) {
        return errors;
    }

    if (!user.approvedAt || typeof user.approvedAt !== 'string') {
        errors.push(`${fieldName}.approvedAt is required and must be an ISO 8601 timestamp string`);
    }

    return errors;
}

/**
 * Creates a display name from user object
 * 
 * @param user - User object
 * @returns Formatted display name
 */
export function getUserDisplayName(user: UserInfo): string {
    return `${user.firstName} ${user.lastName} (${user.username})`;
}
