
module.exports = (req, res, next) => {
    try {
        const { product_id } = req.params;


        res.send({
            message: 'Add item to cart',
            productId: product_id
        });
    } catch(err) {
        next(err);
    }
}
