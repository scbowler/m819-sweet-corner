const db = require('../db');

exports.imageUrl = function(req, type, file) {
    return `${req.protocol}://${req.get('host')}/images/${type}s/${file}`;
}

exports.getCartTotals = async function(cartId){
    const [[totals]] = await db.execute(`
        SELECT SUM(i.quantity) AS items, SUM(p.cost * i.quantity) AS cost 
        FROM cart AS c
        JOIN cartItems as i ON c.id=i.cartId
        JOIN products AS p ON i.productId=p.id
        WHERE c.id=?
    `, [cartId]);

    return {
        cost: parseInt(totals.cost) || 0,
        items: parseInt(totals.items) || 0
    };
}
