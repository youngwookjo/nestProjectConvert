import express from 'express';
import multer from 'multer';
import s3Controller from '@modules/s3/s3Controller';
import s3Validator from '@modules/s3/s3Validator';

const s3Router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

s3Router
  .route('/upload')
  .post(upload.single('image'), s3Validator.validateImageUpload, s3Controller.uploadImage);

export default s3Router;
