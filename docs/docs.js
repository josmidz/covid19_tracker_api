/**
 * 
 * Update on 12-DEC-2019

Unlike some other modes like CBC, GCM mode does not require the IV to be unpredictable. The only requirement is that the IV has to be unique for each invocation with a given key. If it repeats once for a given key, security can be compromised. An easy way to achieve this is to use a random IV from a strong pseudo random number generator as shown below.

Using a sequence or timestamp as IV is also possible, but it may not be as trivial as it may sound. For example, if the system does not correctly keep track of the sequences already used as IV in a persistent store, an invocation may repeat an IV after a system reboot. Likewise, there is no perfect clock. Computer clocks readjusts etc.

Also, the key should be rotated after every 2^32 invocations. For further details on the IV requirement, refer to this answer and the NIST recommendations.

Update on 30-JUL-2019

As the answer is getting more views and votes, I think it is worth mentioning that the code below has used a *Sync method - crypto.scryptSync. Now that is fine if the encryption or decryption is done during application initialization. Otherwise, consider using the asynchronous version of the function to avoid blocking the event loop. (A promise library like bluebird is useful).

Update on 23-JAN-2019

The bug in decryption logic has been fixed. Thanks @AlexisWilke for rightly pointing it out.

The accepted answer is 7 years old and doesn't look secured today. Hence, I'm answering it:

Encryption Algorithm: Block cipher AES with 256 bits key is considered secure enough. To encrypt a complete message, a mode needs to be selected. Authenticated encryption (which provides both confidentiality and integrity) is recommended. GCM, CCM and EAX are most commonly used authenticated encryption modes. GCM is usually preferred and it performs well in Intel architectures which provide dedicated instructions for GCM. All these three modes are CTR-based (counter-based) modes and therefore they do not need padding. As a result they are not vulnerable to padding related attacks

An initialization Vector (IV) is required for GCM. The IV is not a secret. The only requirement being it has to be random or unpredictable. In NodeJs, crypto.randomBytes() is meant to produce cryptographically strong pseudo random numbers.

NIST recommends 96 bit IV for GCM to promote interoperability, efficiency, and simplicity of design

The recipient needs to know the IV to be able to decrypt the cipher text. Therefore the IV needs to be transferred along with the cipher text. Some implementations send the IV as AD (Associated Data) which means that the authentication tag will be calculated on both the cipher text and the IV. However, that is not required. The IV can be simply pre-pended with the cipher text because if the IV is changed during transmission due to a deliberate attack or network/file system error, the authentication tag validation will fail anyway

Strings should not be used to hold the clear text message, password or the key as Strings are immutable which means we cannot clear the strings after use and they will linger in the memory. Thus a memory dump can reveal the sensitive information. For the same reason, the client calling these encryption or decryption methods should clear all the Buffer holding the message, key or the password after they are no longer needed using bufferVal.fill(0).

Finally for transmission over network or storage, the cipher text should be encoded using Base64 encoding. buffer.toString('base64'); can be used to convert the Buffer into Base64 encoded string.

Note that the key derivation scrypt (crypto.scryptSync()) has been used to derive a key from a password. However, this function is available only in Node 10.* and later versions

The code goes here:
 */

const crypto = require('crypto');

var exports = module.exports = {};

const ALGORITHM = {

    /**
     * GCM is an authenticated encryption mode that
     * not only provides confidentiality but also 
     * provides integrity in a secured way
     * */  
    BLOCK_CIPHER: 'aes-256-gcm',

    /**
     * 128 bit auth tag is recommended for GCM
     */
    AUTH_TAG_BYTE_LEN: 16,

    /**
     * NIST recommends 96 bits or 12 bytes IV for GCM
     * to promote interoperability, efficiency, and
     * simplicity of design
     */
    IV_BYTE_LEN: 12,

    /**
     * Note: 256 (in algorithm name) is key size. 
     * Block size for AES is always 128
     */
    KEY_BYTE_LEN: 32,

    /**
     * To prevent rainbow table attacks
     * */
    SALT_BYTE_LEN: 16
}

const getIV = () => crypto.randomBytes(ALGORITHM.IV_BYTE_LEN);
exports.getRandomKey = getRandomKey = () => crypto.randomBytes(ALGORITHM.KEY_BYTE_LEN);

/**
 * To prevent rainbow table attacks
 * */
exports.getSalt = getSalt = () => crypto.randomBytes(ALGORITHM.SALT_BYTE_LEN);

/**
 * 
 * @param {Buffer} password - The password to be used for generating key
 * 
 * To be used when key needs to be generated based on password.
 * The caller of this function has the responsibility to clear 
 * the Buffer after the key generation to prevent the password 
 * from lingering in the memory
 */
exports.getKeyFromPassword = getKeyFromPassword = (password, salt) => {
    return crypto.scryptSync(password, salt, ALGORITHM.KEY_BYTE_LEN);
}

/**
 * 
 * @param {Buffer} messagetext - The clear text message to be encrypted
 * @param {Buffer} key - The key to be used for encryption
 * 
 * The caller of this function has the responsibility to clear 
 * the Buffer after the encryption to prevent the message text 
 * and the key from lingering in the memory
 */
exports.encrypt = encrypt = (messagetext, key) => {
    const iv = getIV();
    const cipher = crypto.createCipheriv(
        ALGORITHM.BLOCK_CIPHER, key, iv, { 'authTagLength': ALGORITHM.AUTH_TAG_BYTE_LEN });
    let encryptedMessage = cipher.update(messagetext);
    encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
    return Buffer.concat([iv, encryptedMessage, cipher.getAuthTag()]);
}

/**
 * 
 * @param {Buffer} ciphertext - Cipher text
 * @param {Buffer} key - The key to be used for decryption
 * 
 * The caller of this function has the responsibility to clear 
 * the Buffer after the decryption to prevent the message text 
 * and the key from lingering in the memory
 */
exports.decrypt = decrypt = (ciphertext, key) => {
    const authTag = ciphertext.slice(-16);
    const iv = ciphertext.slice(0, 12);
    const encryptedMessage = ciphertext.slice(12, -16);
    const decipher = crypto.createDecipheriv(
        ALGORITHM.BLOCK_CIPHER, key, iv, { 'authTagLength': ALGORITHM.AUTH_TAG_BYTE_LEN });
    decipher.setAuthTag(authTag);
    let messagetext = decipher.update(encryptedMessage);
    messagetext = Buffer.concat([messagetext, decipher.final()]);
    return messagetext;
}



/**
 * And the unit tests are also provided below:
 */

const assert = require('assert');
const cryptoUtils = require('../lib/crypto_utils');
describe('CryptoUtils', function() {
  describe('decrypt()', function() {
    it('should return the same mesage text after decryption of text encrypted with a randomly generated key', function() {
      let plaintext = 'my message text';
      let key = cryptoUtils.getRandomKey();
      let ciphertext = cryptoUtils.encrypt(plaintext, key);

      let decryptOutput = cryptoUtils.decrypt(ciphertext, key);

      assert.equal(decryptOutput.toString('utf8'), plaintext);
    });

    it('should return the same mesage text after decryption of text excrypted with a key generated from a password', function() {
      let plaintext = 'my message text';
      /**
       * Ideally the password would be read from a file and will be in a Buffer
       */
      let key = cryptoUtils.getKeyFromPassword(Buffer.from('mysecretpassword'), cryptoUtils.getSalt());
      let ciphertext = cryptoUtils.encrypt(plaintext, key);

      let decryptOutput = cryptoUtils.decrypt(ciphertext, key);

      assert.equal(decryptOutput.toString('utf8'), plaintext);
    });
  });
});



import crypto from 'crypto';
var algorithm = "aes-192-cbc"; //algorithm to use
const key = crypto.scryptSync(secretKey, 'salt', 24); //create key 24

export function encryptFx(info) {
    const iv = crypto.randomBytes(12); // generate different ciphertext everytime 16
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    var encrypted = cipher.update(JSON.stringify(info), 'utf8', 'hex') + cipher.final('hex'); // encrypted text
    return `${iv.toString('hex')}+${encrypted}`;
}

export function decryptFx(enc) {
    const _tb = enc.split('+');
    console.log("info : ",_tb)
    let [iv,encrypted] = _tb;
    console.log("info : ",iv)
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv));
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'); //deciphered text
    return JSON.parse(decrypted);
}