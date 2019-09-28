const db = require('../../../db');
const jwt = require('jwt-simple');
const { cartSecret } = require('../../../config/jwt_cart');
const { imageUrl, getCartTotals } = require('../../../helpers');

module.exports = async (req, res, next) => {
    try {
        let cartToken = req.headers['x-cart-token'] || null;
        const { quantity = 1 } = req.body;
        const { product_id } = req.params;
        let cartId = null;

        if(isNaN(quantity)){
            throw new StatusError(422, 'Invalid quantity received, must be a number');
        }

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

        const [[cart]] = await db.query('SELECT * FROM cart WHERE id=?', [cartId]);

        const [[existingItem = null]] = await db.query('SELECT id, quantity FROM cartItems WHERE productId=? AND cartId=?', [product.id, cartId]);
        let itemId = null;

        if(!existingItem){
            const [addItemResult] = await db.execute('INSERT INTO cartItems (pid, cartId, productId, quantity) VALUES (UUID(), ?, ?, ?)', [cartId, product.id, quantity]);

            itemId = addItemResult.insertId;
        } else {
            const [updateResult] = await db.execute('UPDATE cartItems SET quantity=quantity + ? WHERE id=?', [quantity, existingItem.id]);
            
            itemId = existingItem.id;
        }

        const [[output]] = await db.query(`
            SELECT ci.createdAt AS added, p.cost AS "each", ci.pid AS itemId, p.name,
                p.pid AS productId, ci.quantity, i.altText, i.file, (p.cost * ci.quantity) AS total 
            FROM cartItems AS ci 
            JOIN products AS p ON ci.productId=p.id
            JOIN images AS i ON i.productId=p.id
            WHERE ci.id=? AND i.type="thumbnail" LIMIT 1
        `, [itemId]);

        const { altText, file, ...itemInfo } = output;

        const total = await getCartTotals(cart.pid);

        res.send({
            cartId: cart.pid,
            cartToken: cartToken,
            item: {
                ...itemInfo,
                thumbnail: {
                    altText: altText,
                    url: imageUrl(req, 'thumbnail', file)
                }
            },
            message: `${quantity} ${itemInfo.name} cupcakes added to cart`,
            total: {
                cost: parseInt(total.cost),
                items: parseInt(total.items)
            }
        });
    } catch(err) {
        next(err);
    }
}