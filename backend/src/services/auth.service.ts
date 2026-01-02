import { AuthRepository } from '../repositories/auth.repository';
import { generateOtp } from '../utils/otp';
import { sendOtpEmail } from '../utils/mailer';
import { generateJwt } from '../utils/tokens';

export class AuthService {
    static async initiateLogin(email: string): Promise<void> {
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await AuthRepository.invalidateOldOtps(email);
        await AuthRepository.createOtp(email, otp, expiresAt);
        await sendOtpEmail(email, otp);
    }

    static async verifyLogin(email: string, otp: string): Promise<{ token: string, user: any }> {
        const otpId = await AuthRepository.findValidOtp(email, otp);
        if (!otpId) {
            throw new Error('INVALID_OTP');
        }

        await AuthRepository.markOtpAsUsed(otpId);
        const user = await AuthRepository.upsertUser(email);
        const token = generateJwt(user.id);

        return { token, user };
    }
}
