module.exports = (req, res, next) => {
    try {
        res.send({
            message: 'Cart totals endpoint, working!'
        });
    } catch (error) {
        next(error);
    }
}
