const crypto = require('crypto');

// Minimal TOTP (RFC 6238) verification using only Node's built in crypto.
// The shared secret is a base32 string, the same one scanned into an
// authenticator app (Google Authenticator, Microsoft Authenticator, Authy).

const base32Decode = (input) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(input).replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

const totpCode = (secret, counter) => {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1000000).padStart(6, '0');
};

// Accepts the current code plus one step either side, so small clock
// differences between the server and the phone do not lock the owner out.
const verifyTotp = (secret, token) => {
  const clean = String(token || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  const given = Buffer.from(clean);
  for (const drift of [-1, 0, 1]) {
    const expected = Buffer.from(totpCode(secret, counter + drift));
    if (expected.length === given.length && crypto.timingSafeEqual(expected, given)) {
      return true;
    }
  }
  return false;
};

module.exports = { verifyTotp };
