import { randomInt } from "node:crypto";

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateTempPassword(length = 10) {
  let password = "";
  for (let index = 0; index < length; index += 1) password += chars[randomInt(chars.length)];
  return password;
}
