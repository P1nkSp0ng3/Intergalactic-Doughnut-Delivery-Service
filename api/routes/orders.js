const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => { // handle GET requests to /orders via an arrow function (to define an anonymous function)
    res.status(200).json({
        message: 'Orders fetched!'
    });
});

router.post('/', (req, res, next) => { // handle POST requests to /orders
    res.status(201).json({
        message: 'Order created!'
    });
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