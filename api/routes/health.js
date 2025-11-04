const express = require(`express`);
const router = express.Router();
const db = require(`../database/connection`);

// health route handler
router.get('/', (req, res, next) => {
    try {
        const startTime = Date.now();
        const query = `SELECT 1 AS ok`;
        db.query(query, (error) => { // execute SQL query
            const dbStatus = error ? `⚠️ Galactic database offline!` : `🍩 Database connection stable!`; // conditional (ternary) operator for shorthand if statement
            const healthStatus = error ? `⚠️ Critical: Database connection lost!` : `🍩 All systems nominal`; // conditional (ternary) operator for shorthand if statement
            const responseTime = Date.now() - startTime;
            if(error) {
                console.error(`Health check DB failure:`, error.sqlMessage || error.message);
            }
            res.status(error ? 503 : 200).json({
                announcement: `Qagh: ${healthStatus}`,
                statusReport: {
                    apiStatus: `🍩 The Intergalactic Doughnut API is standing by and ready for service.`,
                    databaseStatus: dbStatus,
                    uptime: `${process.uptime().toFixed(2)} seconds`,
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                }
            });
        });
    } catch(error) {
        console.error(`API health check failed:`, error);
        res.status(500).json({
            announcement: `Qagh: ☠️ Catastrophic failure detected in the doughnut command module!`,
            errorDetails: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;