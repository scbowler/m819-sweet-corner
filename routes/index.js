const router = require('express').Router();
const apiRouter = require('./api');
const imagesRouter = require('./images');

// ALL METHODS /api
router.use('/api', apiRouter);

// ALL METHODS /images
router.use('/images', imagesRouter);

module.exports = router;
