const router = require('express').Router();
const testController = require('../../controllers/api/test');
const productsRouter = require('./products');
const cartRouter = require('./cart');

// GET /api/test
router.get('/test', testController);

// ALL METHODS /api/products
router.use('/products', productsRouter);

// All Methods /api/cart
router.use('/cart', cartRouter);

module.exports = router;
