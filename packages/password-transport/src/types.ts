/** Matches GET /auth/login-crypto-params response */
export interface LoginCryptoParams {
  version: string;
  keyId: string;
  publicKey: string;
  algorithm: string;
}

/** Body for POST /auth/login (protected password) */
export interface ProtectedLoginPayload {
  email: string;
  version: string;
  keyId: string;
  ciphertext: string;
  iv: string;
  wrappedKey: string;
  authTag: string;
}

export const SUPPORTED_CRYPTO_VERSION = '1';
