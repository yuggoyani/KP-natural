import crypto from "crypto";

/**
 * Generate a unique 5-digit numeric Order ID
 * Example: 48291, 10543, 78326
 * Range: 10000 to 99999
 */
export function generateOrderId(): string {
  const min = 10000;
  const max = 99999;
  
  if (crypto.randomInt) {
    return String(crypto.randomInt(min, max + 1));
  }
  
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(num);
}
