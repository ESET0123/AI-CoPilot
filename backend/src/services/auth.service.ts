import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  static async findUserByKeycloakId(keycloakId: string) {
    return AuthRepository.findByKeycloakId(keycloakId);
  }

  static async upsertUserFromKeycloak(keycloakId: string, email: string) {
    return AuthRepository.upsertUserFromKeycloak(keycloakId, email);
  }
}
