const jwt = require('jwt-simple');
const { cartSecret } = require('../../../config/jwt_cart');
const db = require('../../../db');
const { imageUrl } = require('../../../helpers');

module.exports = async (req, res, next) => {
    try {
        const cartToken = req.headers['x-cart-token'] || null;

        if (!cartToken) {
            throw new StatusError(400, 'Missing cart token');
        }

        const tokenData = jwt.decode(cartToken, cartSecret);

        const [results] = await db.query(`
            SELECT c.pid AS cartId, ci.createdAt AS added, p.cost AS 'each', ci.pid AS itemId, p.name, 
                p.pid AS productId, ci.quantity, i.altText, i.file, (p.cost * ci.quantity) AS total 
            FROM cart AS c
            JOIN cartItems AS ci ON c.id=ci.cartId
            JOIN products AS p ON ci.productId=p.id
            JOIN images AS i ON p.id=i.productId
            WHERE c.id=? AND i.type="thumbnail"
        `, [tokenData.cartId]);

        let cartId = null;
        const total = {
            cost: 0,
            items: 0
        }

        const items = results.map(i => {
            const { altText, file, cartId: cid, ...item } = i;

            cartId = cid;

            total.cost += item.total,
            total.items += item.quantity
            
            return {
                ...item,
                thumbnail: {
                    altText,
                    url: imageUrl(req, 'thumbnail', file)
                }
            }
        });

        res.send({ cartId, items, total });
    } catch (error) {
        next(error);
    }
}
