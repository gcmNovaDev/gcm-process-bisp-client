import crypto from "crypto";

/**
 * Cifra un texto plano utilizando AES-256-CBC a partir de un secreto base.
 * Retorna el resultado en formato: ivHex-encryptedHex
 */
export function encryptToken(text: string, secretKey: string): string {
  // Aseguramos una clave de 32 bytes (256 bits) derivándola con SHA-256 del secreto
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}-${encrypted}`;
}
