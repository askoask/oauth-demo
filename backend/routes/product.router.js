import express from 'express';
import userService from '../services/user.service.js';
import strapiService from '../services/strapi.service.js';
import productService from '../services/product.service.js';
import { inspect } from 'node:util';

const productRouter = express.Router();
productRouter.post('/book', async (req, res) => {
  const user = await userService.findUserById(req.userId);
  if (!user) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const product = productService.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const isPaymentSuccessful = await strapiService.makeTestPayment(
    productId,
    product.price,
    user.stripeCustomerId,
    user.paymentMethodId
  );
  // const isPaymentSuccessful = true;

  if (!isPaymentSuccessful) {
    return res.status(500).json({ status: 'error', message: 'Payment failed' });
  }

  const productKey = productService.generateProductKey(productId, user.id);

  console.log(
    `User ${user.id} (${inspect(user.email)}) bought product ${productId} (${inspect(product.title)})`
  );

  res.json({
    status: 'success',
    productKey,
  });
});

productRouter.get('/', (req, res) => {
  const products = productService.findAll();
  const sortedProducts = [...products].sort((a, b) => a.price - b.price);
  res.json(sortedProducts);
});

export default productRouter;
