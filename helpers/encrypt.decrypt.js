
import crypto from 'crypto'; 
import { resolve } from 'path';
// const iv = crypto.randomBytes(16);
export function encryptFx(payload) {
  return new Promise((resolve,reject)=>{
    try {
      let secretKey = process.env.SECRET;
      let algorithm = process.env.ALGORITHM;
      let iv = process.env.IV;
      let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey,'hex'),Buffer.from(iv,'hex') );
      let encrypted = cipher.update(JSON.stringify(payload));
      encrypted = Buffer.concat([encrypted, cipher.final()]);
  //   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
      return resolve({data:encrypted.toString('hex')})
    } catch (err) {
      resolve({err:err})
    }
  })
}

export function decryptFx(encrypted) {
    // let iv = Buffer.from(text.iv, 'hex');
    return new Promise((resolve,reject)=>{
      try {
        let secretKey = process.env.SECRET;
        let algorithm = process.env.ALGORITHM;
        let iv = process.env.IV;
        let encryptedText = Buffer.from(encrypted, 'hex');
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey,'hex'), Buffer.from(iv,'hex'));
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return resolve({data:decrypted.toString()});
      } catch (err) {
        return resolve({err:err});
      }
    })
}
