const router = require('express').Router();
const apiRouter = require('./api');

// ALL METHODS /api
router.use('/api', apiRouter);

module.exports = router;
