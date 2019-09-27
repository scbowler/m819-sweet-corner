module.exports = (req, res, next) => {
    try {
        res.send({
            message: 'get cart endpoint, working!'
        });
    } catch (error) {
        next(error);
    }
}
