import fs from 'fs';
import path from 'path';
import s3, { S3_BUCKET } from '../config/s3.js';
import logger from '../utils/logger.js';

const useS3 = () =>
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET);

export const uploadFile = async (file, folder = 'uploads') => {
  if (!useS3()) {
    return {
      url: `/uploads/${file.filename}`,
      key: file.filename,
      local: true,
    };
  }

  const fileContent = fs.readFileSync(file.path);
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  await s3
    .upload({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
    })
    .promise();

  fs.unlinkSync(file.path);

  return {
    url: `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    key,
    local: false,
  };
};

export const getSignedUrl = (key, expiresIn = 3600) => {
  if (!useS3() || !key) return null;
  return s3.getSignedUrl('getObject', {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expiresIn,
  });
};

export const deleteFile = async (key) => {
  if (!useS3() || !key) return;
  try {
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: key }).promise();
  } catch (error) {
    logger.error(`S3 delete failed: ${error.message}`);
  }
};

export const getLocalFilePath = (filename) =>
  path.join(process.cwd(), 'uploads', filename);
