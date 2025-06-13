import { productsData } from '../data/products.data.js';
import crypto from 'node:crypto';

class ProductService {
  static #instance;

  constructor() {
    if (ProductService.#instance) {
      return ProductService.#instance;
    }
    ProductService.#instance = this;
  }

  /**
   * Find all products.
   * @returns {object[]} Array of all product objects.
   */
  findAll() {
    return productsData;
  }

  /**
   * Find a product by its unique ID.
   * @param {string} id - The product's ID.
   * @returns {object|null} The product object or null if not found.
   */
  findById(id) {
    return productsData.find((product) => product.id === id) || null;
  }

  generateProductKey(productId, userId) {
    const key = `${productId}-${userId}-${process.env.PRODUCT_KEY_HASH_SECRET}`;
    return (
      'PRODUCT-KEY-' + crypto.createHash('sha256').update(key).digest('hex')
    );
  }
}

export default new ProductService();
