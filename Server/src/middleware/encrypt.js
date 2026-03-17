const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Derive a 32-byte key from the env variable (pad/truncate to 32 chars)
 */
function getKey() {
  const raw = process.env.AES_SECRET_KEY || '';
  return Buffer.from(raw.padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH));
}

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Middleware: decrypt incoming encrypted payload.
 * Client sends: { payload: "<encrypted>" }
 * This replaces req.body with the decrypted JSON object.
 * Falls back gracefully if payload field is absent (plain requests still work).
 */
const decryptRequest = (req, res, next) => {
  try {
    if (req.body && req.body.payload) {
      const decrypted = decrypt(req.body.payload);
      req.body = JSON.parse(decrypted);
    }
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid encrypted payload.' });
  }
};

/**
 * Middleware: encrypt outgoing response body.
 * Wraps res.json so every JSON response is encrypted.
 */
const encryptResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    const encrypted = encrypt(JSON.stringify(data));
    return originalJson({ payload: encrypted });
  };
  next();
};

module.exports = { encrypt, decrypt, decryptRequest, encryptResponse };
