import bcrypt from "bcryptjs";

/**
 * Hash a plain text password using bcrypt with salt rounds
 * @param password Plain text password
 * @param saltRounds Number of salt rounds (default: 10)
 * @returns Hashed password string
 */
export async function hashPassword(password: string, saltRounds = 10): Promise<string> {
  if (!password) throw new Error("Password cannot be empty");
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password against a bcrypt hash
 * @param password Plain text candidate password
 * @param hash Hashed password to compare against
 * @returns boolean true if match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
