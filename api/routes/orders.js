const express = require('express');
const router = express.Router();
const db = require(`../database/connection`);

router.get('/', (req, res, next) => { // handle GET requests to /orders via an arrow function (to define an anonymous function)
    res.status(200).json({
        message: 'Orders fetched!'
    });
});

// create a new doughnut order route handler
router.post('/', (req, res, next) => {
    const { productId, quantity } = req.body; // destructuring assignment for shorthand variable declaration
    /*const selectQuery = `SELECT * FROM products WHERE id = ?`; // parameterised query (prepared statement) - check if product with specified ID exists
    db.query(selectQuery, [productId], (selectError, results) => { // execute SQL query
        if(selectError) {
            console.error(`Galactic database malfunction:`, selectError.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem locating the doughnut!`,
                details: selectError.sqlMessage
            });
        }
        if(results.length === 0) {
            return res.status(404).json({
                announcement: `Qagh: 🔎 No trace of doughnut #${productId}! The bakers suspect it was eaten by space pirates.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const product = results[0];
        console.log(product);
        if(product.stock < quantity) { // stock check
            return res.status(400).json({ // 400 Bad Request
                announcement: `🚫 Not enough stock for ${product.name}. Only ${product.stock} available!`
            });
        }
        const insertQuery = `INSERT INTO orders (product_id, quantity) VALUES (?, ?)`; // parameterised query (prepared statement) - create order
        db.query(insertQuery, [productId, quantity], (insertError, insertResult) => {
            if(insertError) {
                console.error(`Galactic database malfunction:`, insertError.sqlMessage);
                return res.status(500).json({ // 500 Internal Server Error
                    announcement: `Qagh: ⚠️ Houston, we have a problem creating the doughnut order!`,
                    details: insertError.sqlMessage
                });
            }
            const updateQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`; // parameterised query (prepared statement) - update product stock value
            db.query(updateQuery, [quantity, productId], (updateError, updateResults) => {
                if(updateError) {
                    console.error(`Galactic database malfunction:`, updateError.sqlMessage);
                    return res.status(500).json({ // 500 Internal Server Error
                        announcement: `Qagh: ⚠️ Houston, we have a problem updating the doughnut's stock value!`,
                        details: updateError.sqlMessage
                    });
                }
                res.status(201).json({
                    announcement: `🍩 Order placed successfully!`,
                    order: {
                        id: insertResult.insertId,
                        product: product.name,
                        quantity,
                        remainingStock: product.stock - quantity
                    }
                });
            });
        });
    });*/
});



























router.get('/:orderId', (req, res, next) => { // handle GET requests to /orders/:id
    const orderId = req.params.orderId;
    res.status(200).json({
        id: orderId,
        message: 'Order with id of ' + orderId + ' fetched!'
    });
});

router.delete('/:orderId', (req, res, next) => { // handle DELETE requests to /orders/:id
    const orderId = req.params.orderId;
    res.status(200).json({
        id: orderId,
        message: 'Order with id of ' + orderId + ' deleted!'
    });
});

module.exports = router;