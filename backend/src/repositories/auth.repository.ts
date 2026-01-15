import { pool } from "../db/pool";

export class AuthRepository {
  static async upsertUserFromKeycloak(keycloakId: string, email: string) {
    const result = await pool.query(
      `
      INSERT INTO users (email, keycloak_id, is_email_verified)
      VALUES ($1, $2, true)
      ON CONFLICT (email)
      DO UPDATE SET keycloak_id = $2, is_email_verified = true
      RETURNING id, email, keycloak_id, role
      `,
      [email, keycloakId]
    );

    return result.rows[0];
  }

  static async findByKeycloakId(keycloakId: string) {
    const result = await pool.query(
      `SELECT id, email, role FROM users WHERE keycloak_id = $1`,
      [keycloakId]
    );
    return result.rows[0] || null;
  }
}
