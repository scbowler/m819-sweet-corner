const router = require('express').Router();
const testController = require('../../controllers/api/test');
const productsRouter = require('./products');

// GET /api/test
router.get('/test', testController);

// ALL METHODS /api/products
router.use('/products', productsRouter);

module.exports = router;
