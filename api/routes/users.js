const express = require(`express`);
const router = express.Router();
const { v1: uuidv1 } = require(`uuid`);
const db = require(`../database/connection`);

// test

// create new user account route handler
router.post(`/register`, (req, res, next) => {
    function sanitiseInput(input) { // input sanitisation for XSS protection
        if(!input || typeof input !== `string`) return ``;
        let safe = input
            .replace(/&lt;/gi, `<`)
            .replace(/&gt;/gi, `>`)
            .replace(/&quot;/gi, `"`)
            .replace(/&#x2F;/gi, `/`)
            .replace(/&#39;/gi, `'`);
        safe = safe.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ``); // remove <script> HTML blocks
        safe = safe.replace(/\son[a-z]+\s*=\s*(["']?).*?\1/gi, ``); // remove inline on* event handlers
        safe = safe.replace(/(javascript:|data:|vbscript:)/gi, ``); // strip javascript:, vbscript:, and data: URIs
        safe = safe.replace(/<[^>]*>/g, ``); // remove unwanted tags
        return safe.trim();
    }
    const rawUsername = req.body.username || ``;
    const username = sanitiseInput(rawUsername);
    const password = (req.body.password || ``).toString();
    const uuid = uuidv1();
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,16}$/;
    const allowedRoles = [`user`, `admin`]; // allowlist
    if(!username) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 A username is required (with valid characters) before joining the Intergalactic Baker's Guild!`
        });
    }
    if(username.length < 3 || username.length > 50) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Username must be between 3 and 50 characters, doughnut-deprived Martian!`
        });
    }
    if(!password) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Every spacefarer needs a password before takeoff!`
        });
    }
    if(!passwordRegex.test(password)) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 By the Great Oven! That password is too weak for warp travel. Passwords must be 6-16 characters, contain upper and lower case letters, and at least one number.`
        });
    }
    let role = `user`;
    if(req.body.role) {
        const requestedRole = req.body.role.toString().toLowerCase().trim();
        if(allowedRoles.includes(requestedRole)) role = requestedRole; // else, do nothing and default to the `user` role
    }
    const userCheckQuery = `SELECT COUNT(*) AS resultsCount FROM users WHERE username = ?`; // parameterised query (prepared statement)
    db.query(userCheckQuery, [username], (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction during username check:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem checking for existing crew usernames!`
            });
        }
        const exists = results && results[0] && results[0].resultsCount > 0;
        if(exists) {
            return res.status(409).json({ // 409 Conflict
                announcement: `Qagh: 🚫 The call-sign ${username} is already registered in the Galactic Fleet!`
            });
        }
        const insertQuery = `INSERT INTO users (username, uuid, password, role) VALUES (?, ?, ?, ?)`; // parameterised query (prepared statement)
        db.query(insertQuery, [username, uuid, password, role], (error, results) => { // execute SQL query
            if(error) {
                console.error(`Galactic database malfunction during user creation:`, error.sqlMessage);
                if(error.code === `ER_DUP_ENTRY`) {
                    return res.status(409).json({ // 409 Conflict
                        announcement: `Qagh: 🚫 Username ${username} already taken by another space traveller!`
                    });
                }
                return res.status(500).json({ // 500 Internal Server Error
                    announcement: `Qagh: ⚠️ Houston, we have a problem creating the user account!`
                });
            }
            const createdAccount = {
                id: results.insertId,
                username,
                uuid,
                role
            };
            return res.status(201).json({ // 201 Created
                announcement: `🫡 Welcome aboard, ${username}! Your credentials have been logged with the Galactic Bakers' Registry.`,
                createdAccount
            });
        });
    });
});



router.post(`/login`, (req, res, next) => {

});



// uuidv1 IDOR vuln in here
// uuidv1 values generated at register endpoint
router.get(`/:uuid/profile`, (req, res, next) => {

});



router.delete(`/:userId`, (req, res, next) => {

});



router.patch(`/:id/password`, (req, res, next) => {

});



router.patch(`/:id/role`, (req, res, next) => {

});

module.exports = router;