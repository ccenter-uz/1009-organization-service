import * as CryptoJS from 'crypto-js';

export const encrypt = (data: string): string => {
  const stringData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(
    stringData,
    process.env.ENCRYPTION_KEY || '1q2w3e4r'
  ).toString();
};

export const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.ENCRYPTION_KEY || '1q2w3e4r'
  );
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
