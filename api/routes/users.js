const express = require(`express`);
const router = express.Router();
const { v1: uuidv1 } = require(`uuid`);
const db = require(`../database/connection`);

router.post(`/register`, (req, res, next) => {
    const username = (req.body.username || ``).toString().trim();
    const uuid = uuidv1();
    const password = (req.body.password || ``).toString(); // plaintext password (intentionally insecure)
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/; // weak password policy
    const role = (req.body.role !== undefined) ? req.body.role.toString() : `user`; // mass-assignment vulnerability
    if(!username) {
        return res.status(400).json({
            announcement: `Qagh: 🚫 A name is required before joining the Intergalactic Baker's Guild!`
        });
    }
    if(!password) {
        return res.status(400).json({
            announcement: `Qagh: 🚫 Every spacefarer needs a password before takeoff!`
        });
    }
    if(!passwordRegex.test(password)) {
        return res.status(400).json({
            announcement: `Qagh: 🚫 By the Great Oven! That password is too weak for warp travel. Use ≥6 chars, with at least one uppercase, one lowercase and one digit.`
        });
    }
    const userCheckQuery = `SELECT COUNT(*) AS resultsCount FROM users WHERE username = ?`;
    db.query(userCheckQuery, [username], (error, results) => {
        if (error) {
            console.error(`Galactic database malfunction during username check:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem checking for existing crew names!`,
                details: error.sqlMessage
            });
        }
        const exists = results && results[0] && results[0].resultsCount > 0;
        if(exists) {
            return res.status(409).json({ // Username enumeration vulnerability
                announcement: `Qagh: 🚫 The call-sign '${username}' is already registered in the Galactic Fleet!`
            });
        }
        const insertQuery = `INSERT INTO users (username, uuid, password, role) VALUES (?, ?, ?, ?)`;
        db.query(insertQuery, [username, uuid, password, role], (error, results) => {
            if(error) {
                console.error(`Galactic database malfunction during user creation:`, error.sqlMessage);
                if(error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        announcement: `Qagh: 🚫 Username '${username}' already taken by another space traveller!`
                    });
                }
                return res.status(500).json({
                    announcement: `Qagh: ⚠️ Houston, we have a problem creating the user account!`,
                    details: error.sqlMessage
                });
            }
            const createdAccount = {
                id: results.insertId,
                username,
                uuid,
                role
            };
            return res.status(201).json({
                announcement: `✨ Welcome aboard, ${username}! Your credentials have been logged with the Galactic Bakers' Registry.`,
                createdAccount
            });
        });
    });
});



router.post(`/login`, (req, res, next) => {

});



router.get(`/:uuid`, (req, res, next) => {

});



router.delete(`/:userId`, (req, res, next) => {

});



router.patch(`/:id/password`, (req, res, next) => {

});



router.patch(`/:id/role`, (req, res, next) => {

});

module.exports = router;