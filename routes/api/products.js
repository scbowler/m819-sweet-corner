const router = require('express').Router();
const getAll = require('../../controllers/api/products/get_all');

// GET /api/products
router.get('/', getAll);

module.exports = router;
