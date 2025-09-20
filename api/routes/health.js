const express = require('express');
const router = express.Router();

// check API health
router.get('/', (req, res, next) => {
    try {
        // <<<<<<<<< -------- include code to check connection to DB -------- >>>>>>>>>
        res.status(200).json({
            status: "I'm alive and well! Time to buy some doughnuts... $$$",
            uptime: process.uptime(), // how long the API has been running (in seconds)
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('API health check failed: ', error);
        res.status(500).json({
            status: 'Error',
            message: "There's something wrong with me! Check the following output to diagnose the cause...",
            error: error.message
        });
    }
});

module.exports = router;