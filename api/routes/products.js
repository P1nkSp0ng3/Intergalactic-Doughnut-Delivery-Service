const express = require(`express`);
const router = express.Router();
const db = require(`../database/connection`);

// list all doughnuts route handler
router.get(`/`, (req, res, next) => {
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem retrieving the doughnuts!`,
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 Our shelves are temporarily empty! The Galactic Doughnut Chefs are crafting new treats. Please come back soon.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const products = results.map(product => ({
            ...product, // spread syntax to "spread" all key-value pairs
            price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
            stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                : `🪐 ${product.stock} available for intergalactic delivery`
        }));
        res.status(200).json({ // 200 OK
            announcement: `🍩 Welcome to the Intergalactic Doughnut Delivery Service! Feast your eyes on our galactic menu.`,
            count: products.length,
            galacticInventory: products
        });
    });
});

// create a new doughnut route handler
router.post(`/`, (req, res, next) => {
    function singleDecodeEntities(string) { // input sanitisation for XSS protection
    return string
        .replace(/&lt;/gi, `<`)
        .replace(/&gt;/gi, `>`)
        .replace(/&quot;/gi, `"`)
        .replace(/&#x2F;/gi, `/`)
        .replace(/&#39;/gi, `'`);
    };
    function sanitise(input) { // input sanitisation for XSS protection
        if(!input || typeof input !== `string`) return ``;
        let out = singleDecodeEntities(input);
        out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ``); // remove <script> HTML tags
        out = out.replace(/\son[a-z]+\s*=\s*(["']?).*?\1/g, ``); // remove lowercase on* attributes (naive, it does NOT handle camel casing, capitalised or encoded names)
        out = out.replace(/javascript:/g, ``); // naive strip of literal javascript: occurrences (case-sensitive), it leaves capitalised and encoded forms
        out = out.replace(/data:/g, ``); // strip data: URIs that start plainly (case-sensitive)
        out = out.replace(/<(\/?)(?!b\b|i\b|u\b|p\b|br\b|img\b)[^>]*>/gi, ``); // remove unwanted tags but allow a small subset (b,i,u,p,br,img)
        out = out.trim();
        if(out.length > 2000) {
            out = out.slice(0, 2000);
        }
        return out;
    };
    const name = (req.body.name || ``).toString().trim();
    const rawDescription = req.body.description || ``;
    const rawPrice = req.body.price;
    const rawStock = req.body.stock;
    if(!name) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Naming mission incomplete! Every doughnut needs a name to enter the Intergalactic Menu.`
        });
    }
    if(rawPrice === undefined || rawStock === undefined) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Bakers need both a price and stock count before launching (pun intended) this doughnut!`
        });
    }
    const price = Number(rawPrice);
    const stock = parseInt(rawStock, 10);
    if(!Number.isFinite(price) || price < 0 || price > 999999) { // check supplied price value is a finite number, and within a range
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Whoa! That price won't fly in this galaxy.`
        });
    }
    if(!Number.isInteger(stock) || stock < 0 || stock > 1000000) { // check supplied stock value is an integer, and within a range
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Invalid doughnut stock! Bakers cannot deliver that quantity.`
        });
    }
    const description = sanitise(rawDescription); // input sanitisation for XSS protection
    const product = { // building the product JSON object
        name,
        description,
        price,
        stock
    };
    const productCheckQuery = `SELECT COUNT(*) AS resultsCount FROM products WHERE name = ?`; // parameterised query (prepared statement) - check if product with specified name already exists
    db.query(productCheckQuery, [product.name], (error, results) => { // execute SQL query - check-then-insert
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem creating the doughnut!`,
                details: error.sqlMessage
            });
        }
        const exists = (results && results[0] && results[0].resultsCount > 0); // product with specified name already exists
        if(exists) {
            return res.status(409).json({ // 409 Conflict
                announcement: `Qagh: 🚫 A doughnut named ${product.name} already orbits this menu! Aborting creation.`
            });
        }
        setTimeout(() => { // set timeout for artificial delay - aids race-condition exploit
            const query = `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)` // parameterised query (prepared statement)
            db.query(query, [product.name, product.description, product.price, product.stock], (error, results) => { // execute SQL query
                if(error) {
                    console.error(`Galactic database malfunction:`, error.sqlMessage);
                    return res.status(500).json({ // 500 Internal Server Error
                        announcement: `Qagh: ⚠️ Houston, we have a problem creating the doughnut!`,
                        details: error.sqlMessage
                    });
                }
                const createdProduct = {
                    id: results.insertId,
                    ...product, // spread syntax to "spread" all key-value pairs
                    price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
                    stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                        ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                        : `🪐 ${product.stock} available for intergalactic delivery`
                }
                res.status(201).json({ // 201 Created
                    announcement: `🍩 Doughnut ${product.name} created and added to the Intergalactic Menu!`,
                    spawnedDoughnut: createdProduct
                });
            });
        }, 250); // 250ms delay
    });
});

// list a random doughnut route handler
router.get(`/random`, (req, res, next) => {
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem retrieving a random doughnut!`,
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 Our shelves are temporarily empty! The Galactic Doughnut Chefs are crafting new treats. Please come back soon.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const randomIndex = Math.floor(Math.random() * results.length); // generate a random whole number between 0 and results.length
        const product = results[randomIndex];
        const randomProduct = {
            ...product, // spread syntax to "spread" all key-value pairs
            price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
            stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                : `🪐 ${product.stock} available for intergalactic delivery`
        }
        res.status(200).json({ // 200 OK
            announcement: `🍩 Your cosmic craving chooser has selected a random doughnut for you:`,
            cosmicTreat: randomProduct
        });
    });
});

// search for a doughnut route handler
router.get(`/search`, (req, res, next) => {
    const searchTerm = req.query.term; // pull user supplied value from term URL parameter
    if(!searchTerm) {
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 The Search Satellites need a query! Please include ?term=your-flavour`
        });
    }
    const likeTerm = `%${searchTerm}%`; // required for partial matches
    const query = `SELECT * FROM products WHERE name LIKE '${likeTerm}' LIMIT 50`;
    db.query(query, (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem retrieving the searched doughnut!`,
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 You searched for ${searchTerm}... The bakers report no matches in this sector.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const products = results.map(product => ({
            ...product, // spread syntax to "spread" all key-value pairs
            price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
            stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                : `🪐 ${product.stock} available for intergalactic delivery`
        }));
        res.status(200).json({ // 200 OK
            announcement: `🍩 Your mission: locate ${searchTerm}! Expect cosmic anomalies.`,
            count: products.length,
            galacticInventory: products
        });
    });
});

// view a specific doughnut route handler
router.get(`/:productId`, (req, res, next) => {
    const productId = parseInt(req.params.productId, 10); // parse productId as integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-Number or less than/equal to 0, error
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Invalid doughnut identifier! A true alien would use a positive numeric ID.`
        });
    }
    const query = `SELECT * FROM products WHERE id = ?`; // parameterised query (prepared statement)
    db.query(query, [productId], (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem retrieving the specific doughnut!`,
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 No trace of doughnut #${productId}! The bakers suspect it was eaten by space pirates.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const product = results[0];
        const specificProduct = {
            ...product, // spread syntax to "spread" all key-value pairs
            price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
            stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                : `🪐 ${product.stock} available for intergalactic delivery`
        }
        res.status(200).json({ // 200 OK
            announcement: `🍩 Doughnut #${productId} located! Feast your eyes on the cosmic confection.`,
            cosmicTreat: specificProduct
        });
    });
});

// update a doughnut route handler
router.patch(`/:productId`, (req, res, next) => {
    function challengeSanitise(input) { // input sanitisation for XSS protection
        let safe = input
            .replace(/&/g, `&amp;`)
            .replace(/</g, `&lt;`)
            .replace(/>/g, `&gt;`)
            .replace(/"/g, `&quot;`)
            .replace(/'/g, `&#39;`)
            .replace(/\//g, `&#x2F;`);
        safe = safe.replace(/(?:javascript|vbscript|data)\s*:/gi, ``); // strip javascript:, vbscript:, and data: URIs
        safe = safe.replace(/\son\w+\s*=/gi, ``); // remove on* event handlers
        return safe.trim();
    }
    const productId = parseInt(req.params.productId, 10); // parse productId as integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-Number or less than/equal to 0, error
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Invalid doughnut identifier detected! Even Starfleet would know to use a positive integer.`
        });
    }
    if(!req.body || Object.keys(req.body).length === 0) { // if no request body or request body is empty, error
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Bakers report: doughnut data missing! Mission cannot continue.`
        });
    }
    const allowedParameters = [`name`, `description`, `price`, `stock`]; // allowlist
    const updates = {};
    const params = []; // array to store updates object's property values for SQL query
    for(const key of allowedParameters) { // for loop to iterate over the allowlist values
        if(Object.prototype.hasOwnProperty.call(req.body, key)) { // check that the client set the property in the request body (ensure the property wasn't inherited from the object's prototype chain)
            const value = req.body[key];
            if(key === `price`) {
                const p = Number(value);
                if(!Number.isFinite(p) || p < 0 || p > 999999) { // check supplied price value is a finite number, and within a range
                    return res.status(400).json({ // 400 Bad Request
                        announcement: `Qagh: 🚫 Whoa! That price won't fly in this galaxy.`
                    });
                }
                updates[key] = p.toFixed(2);
            } else if(key === `stock`) {
                const s = parseInt(value, 10);
                if(!Number.isInteger(s) || s < 0 || s > 1000000) { // check supplied stock value is an integer, and within a range
                    return res.status(400).json({ // 400 Bad Request
                        announcement: `Qagh: 🚫 Invalid doughnut stock! Bakers cannot deliver that quantity.`
                    });
                }
                updates[key] = s;
            } else if(key === `name` || key === `description`) {
                const o = String(value).trim();
                if(key === `name` && (o.length === 0 || o.length > 100)) {
                    return res.status(400).json({ // 400 Bad Request
                        announcement: `Qagh: 🚫 Invalid doughnut name length! Mission control requires 1-100 characters.`
                    });
                }
                if(key === `description` && o.length > 2000) {
                    return res.status(400).json({ // 400 Bad Request
                        announcement: `Qagh: 🚫 Whoa, baker! Doughnut description over 2000 characters. Keep it brief, chief.`
                    });
                }
                updates[key] = challengeSanitise(o); // input sanitisation for XSS protection
            }
            params.push(updates[key]); // push the updates object's property values to params array
        }
    }
    if(Object.keys(updates).length === 0) { // mass-assignment protection - returns an array of the updates object's property names, returns error if empty (not in the allowlist)
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 Invalid command: the bakers require actual fields to work their magic!`
        });
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(`, `);
    params.push(productId); // push productId value to params array
    const query = `UPDATE products SET ${setClause} WHERE id = ?`; // parameterised query (prepared statement)
    db.query(query, params, (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem updating the doughnut!`,
                details: error.sqlMessage
            });
        }
        if(!results || results.affectedRows === 0) {
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 No trace of doughnut #${productId}! The bakers suspect it was eaten by space pirates.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        const selectSQL = `SELECT id, name, description, price, stock FROM products WHERE id = ?`; // parameterised query (prepared statement)
        db.query(selectSQL, [productId], (selectError, selectResults) => { // execute SQL query
            if(selectError) {
                console.error(`Galactic database malfunction:`, error.sqlMessage);
                return res.status(500).json({ // 500 Internal Server Error
                    announcement: `Qagh: ⚠️ Houston, we have a problem retrieving the doughnut!`,
                    details: selectError.sqlMessage
                });
            }
            const product = selectResults[0];
            const updatedProduct = {
                ...product, // spread syntax to "spread" all key-value pairs
                price: `£${Number(product.price).toFixed(2)}`, // price to 2 decimal places
                stock: product.stock === 0 // conditional (ternary) operator for shorthand if statement
                    ? `🚀 Sorry, this doughnut is currently out of stock in this galaxy!`
                    : `🪐 ${product.stock} available for intergalactic delivery`
            }
            res.status(200).json({ // 200 OK
                announcement: `🍩 Doughnut #${productId} updated in the Intergalactic Menu! Bake on, captain!`,
                cosmicTreat: updatedProduct
            });
        });
    });
});

// delete a doughnut route handler
router.delete(`/:productId`, (req, res, next) => {
    const productId = parseInt(req.params.productId, 10); // parse productId as integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-Number or less than/equal to 0, error
        return res.status(400).json({ // 400 Bad Request
            announcement: `Qagh: 🚫 The doughnut id dishonors the Empire! Provide a positive number before the Great Pastry Council intervenes.`
        });
    }
    const query = `DELETE FROM products WHERE id= ?`; // parameterised query (prepared statement)
    db.query(query, [productId], (error, results) => { // execute SQL query
        if(error) {
            console.error(`Galactic database malfunction:`, error.sqlMessage);
            return res.status(500).json({ // 500 Internal Server Error
                announcement: `Qagh: ⚠️ Houston, we have a problem deleting the doughnut!`,
                details: error.sqlMessage
            });
        }
        if(results.affectedRows === 0) { // no rows deleted
            return res.status(200).json({ // 200 OK
                announcement: `Qagh: 🔎 No trace of doughnut #${productId}! The bakers suspect it was eaten by space pirates.`,
                galacticInventory: `chIm` // chIm = empty in Klingon
            });
        }
        res.status(200).json({ // 200 OK
            announcement: `🍩 Farewell doughnut #${productId}, live long and prosper!`,
            vaporisedDoughnut: productId
        });
    });
});

module.exports = router;