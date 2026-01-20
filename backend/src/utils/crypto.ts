import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Secret key for encryption/decryption. 
 * MUST be 32 bytes (256 bits) for aes-256-gcm.
 */
const ENCRYPTION_KEY = env.COOKIE_ENCRYPTION_KEY;
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;

export class CryptoUtil {
    /**
     * Encrypts a string using AES-256-GCM
     */
    static encrypt(text: string): string {
        const keyBuffer = Buffer.from(ENCRYPTION_KEY);
        if (keyBuffer.length !== 32) {
            throw new Error(`[CryptoUtil] Invalid key length: ${keyBuffer.length} bytes (expected 32 bytes). Check COOKIE_ENCRYPTION_KEY in .env.`);
        }

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Return IV + AuthTag + Encrypted text
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    /**
     * Decrypts a string using AES-256-GCM
     */
    static decrypt(encryptedData: string): string {
        try {
            const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');
            const keyBuffer = Buffer.from(ENCRYPTION_KEY);

            if (keyBuffer.length !== 32) {
                throw new Error(`Invalid key length: ${keyBuffer.length} bytes (expected 32 bytes)`);
            }

            const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('[CryptoUtil] Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }
}
