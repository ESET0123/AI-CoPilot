// import axios from "axios";
// import {
//   keycloakServerUrl,
//   keycloakRealm,
//   keycloakClientId,
//   keycloakClientSecret,
// } from "../config/keycloak.config";
import { AuthRepository } from "../repositories/auth.repository";
// import jwt from "jsonwebtoken";

export class AuthService {
  static async findUserByKeycloakId(keycloakId: string) {
    return AuthRepository.findByKeycloakId(keycloakId);
  }

  static async upsertUserFromKeycloak(keycloakId: string, email: string) {
    return AuthRepository.upsertUserFromKeycloak(keycloakId, email);
  }
}
