import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Verify if the current user is authenticated
 * @returns {Object|null} Session object if authenticated, null otherwise
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    return session;
}

/**
 * Verify if the current user is an admin
 * @returns {Object|null} Session object if admin, null otherwise
 */
export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
        return null;
    }
    return session;
}

/**
 * Check if a string is safe (no script injection attempts)
 * @param {string} str - String to validate
 * @returns {boolean} True if safe
 */
export function isSafeString(str) {
    if (typeof str !== 'string') return true;
    const dangerous = /<script|javascript:|on\w+\s*=/i;
    return !dangerous.test(str);
}

/**
 * Sanitize input by removing potential XSS vectors
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Rate limiting helper - tracks requests per IP
 * Simple in-memory implementation (use Redis in production)
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100;

export function checkRateLimit(ip) {
    const now = Date.now();
    const key = ip || 'unknown';

    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, { count: 1, startTime: now });
        return true;
    }

    const record = rateLimitMap.get(key);

    if (now - record.startTime > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(key, { count: 1, startTime: now });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (now - record.startTime > RATE_LIMIT_WINDOW * 2) {
            rateLimitMap.delete(key);
        }
    }
}, 60000);
