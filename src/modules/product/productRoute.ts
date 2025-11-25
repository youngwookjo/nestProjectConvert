import express from 'express';
import productController from '@modules/product/productController';
import productValidator from '@modules/product/productValidator';
import reviewController from '@modules/review/reviewController';
import reviewValidator from '@modules/review/reviewValidator';
import inquiryController from '@modules/inquiry/inquiryController';
import inquiryValidator from '@modules/inquiry/inquiryValidator';
import { authMiddleware } from '@middlewares/authMiddleware';
import { uploadSingleImage } from '@middlewares/s3Middleware';

const productRouter = express.Router();

productRouter
  .route('/')
  .get(productValidator.validateGetProductList, productController.getProductList)
  .post(
    authMiddleware,
    uploadSingleImage,
    productValidator.validateCreateProduct,
    productController.createProduct,
  );

productRouter
  .route('/:productId/reviews')
  .get(reviewValidator.validateGetReviewList, reviewController.getReviewList)
  .post(authMiddleware, reviewValidator.validateCreateReview, reviewController.createReview);

productRouter
  .route('/:productId/inquiries')
  .get(inquiryValidator.validateGetInquiryList, inquiryController.getInquiryList)
  .post(authMiddleware, inquiryValidator.validateCreateInquiry, inquiryController.createInquiry);

productRouter
  .route('/:productId')
  .get(productValidator.validateGetProduct, productController.getProduct)
  .patch(
    authMiddleware,
    uploadSingleImage,
    productValidator.validateUpdateProduct,
    productController.updateProduct,
  )
  .delete(authMiddleware, productValidator.validateDeleteProduct, productController.deleteProduct);
export default productRouter;
