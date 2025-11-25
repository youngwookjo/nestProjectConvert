import express from 'express';
import storeController from '@modules/store/storeController';
import storeValidator from '@modules/store/storeValidator';
import { authMiddleware } from '@middlewares/authMiddleware';
import { uploadSingleImage } from '@middlewares/s3Middleware';

const storeRouter = express.Router();

storeRouter
  .route('/')
  .post(
    authMiddleware,
    uploadSingleImage,
    storeValidator.validateCreateStore,
    storeController.createStore,
  );

storeRouter
  .route('/detail/my/product')
  .get(authMiddleware, storeValidator.validateGetMyProductList, storeController.getMyProductList);

storeRouter.route('/detail/my').get(authMiddleware, storeController.getMyStore);

storeRouter
  .route('/:storeId/favorite')
  .post(authMiddleware, storeValidator.validateFavoriteStore, storeController.favoriteStore)
  .delete(authMiddleware, storeValidator.validateFavoriteStore, storeController.unfavoriteStore);

storeRouter
  .route('/:storeId')
  .get(storeValidator.validateGetStore, storeController.getStore)
  .patch(
    authMiddleware,
    uploadSingleImage,
    storeValidator.validateUpdateStore,
    storeController.updateStore,
  );

export default storeRouter;
