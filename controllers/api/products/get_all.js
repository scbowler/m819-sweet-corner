const db = require('../../../db');

module.exports = async (req, res, next) => {
    //  Data, Field Data
    // [  [],  []  ]
    const [results] = await db.query('SELECT pid AS id, caption, cost, name FROM products');

    console.log('Products:', results);


    res.send({
        products: results,
        message: 'Get all the products!'
    });
}
