const db = require('../../../db');
const jwt = require('jwt-simple');
const { cartSecret } = require('../../../config/jwt_cart');

module.exports = async (req, res, next) => {
    try {
        let cartToken = req.headers['x-cart-token'] || null;
        const { product_id } = req.params;
        let cartId = null;

        const [[product = null]] = await db.execute('SELECT id FROM products WHERE pid=?', [product_id]);

        if(!product){
            throw new StatusError(404, `No product with ID: ${product_id} found`);
        }

        if(!cartToken){
            const [[activeCartStatus = null]] = await db.query('SELECT id FROM cartStatuses WHERE mid="active"');

            if(!activeCartStatus){
                throw new StatusError(500, 'Error finding cart status');
            }

            const [ newCartResult ] = await db.query('INSERT INTO cart (pid, statusId) VALUES (UUID(), ?)', [activeCartStatus.id]);

            cartId = newCartResult.insertId;

            const tokenData = {
                cartId: cartId,
                ts: Date.now()
            }

            cartToken = jwt.encode(tokenData, cartSecret);
        } else {
            const tokenData = jwt.decode(cartToken, cartSecret);

            cartId = tokenData.cartId;
        }

        const [[existingItem = null]] = await db.query('SELECT id, quantity FROM cartItems WHERE productId=? AND cartId=?', [product.id, cartId]);

        if(!existingItem){
            const [addItemResult] = await db.execute('INSERT INTO cartItems (pid, cartId, productId, quantity) VALUES (UUID(), ?, ?, ?)', [cartId, product.id, 1]);

            console.log('Add Item Result:', addItemResult);
        } else {
            // Update existing items quantity
        }

        // {
        //     cartId: '',
        //     cartToken: '',
        //     message: '1 cupcake added to cart'
        // }

        res.send({
            message: 'Add item to cart',
            productId: product_id,
            cartToken,
            cartId
        });
    } catch(err) {
        next(err);
    }
}
