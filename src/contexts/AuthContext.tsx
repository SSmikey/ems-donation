'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    _id: string;
    username: string;
    role: 'admin' | 'staff';
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // Validate user structure - must have role field
                if (parsed && typeof parsed === 'object' && 'role' in parsed && 'username' in parsed) {
                    console.log('[AuthContext] Loading user from localStorage:', parsed);
                    setUser(parsed);
                } else {
                    console.warn('[AuthContext] Invalid user structure in localStorage, clearing...');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            console.log('[AuthContext] Attempting login for:', username);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[AuthContext] Login response:', data);
                console.log('[AuthContext] User from API:', data.user);
                console.log('[AuthContext] Role from API:', data.user.role);

                const userData = {
                    _id: data.user._id,
                    username: data.user.username,
                    role: data.user.role,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                };
                console.log('[AuthContext] Setting user data:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
