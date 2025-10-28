const express = require('express');
const router = express.Router();
const db = require('../database/connection');

function singleDecodeEntities(string) {
    return string
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#x2F;/gi, '/')
        .replace(/&#39;/gi, "'");
};
function challengeSanitise(input) {
    if(!input || typeof input !== 'string') return '';
    let out = singleDecodeEntities(input);
    out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''); // remove <script> HTML tags
    out = out.replace(/\son[a-z]+\s*=\s*(["']?).*?\1/g, ''); // remove lowercase on* attributes (naive, it does NOT handle ONCLICK or encoded names)
    out = out.replace(/javascript:/g, ''); // naive strip of literal javascript: occurrences (case-sensitive), it leaves JS: in caps, and encoded forms
    out = out.replace(/data:/g, ''); // strip data: URIs that start plainly (case-sensitive)
    out = out.replace(/<(\/?)(?!b\b|i\b|u\b|p\b|br\b|img\b)[^>]*>/gi, ''); // remove unwanted tags but allow a small set (b,i,u,p,br,img)
    out = out.trim();
    if(out.length > 2000) {
        out = out.slice(0, 2000);
    }
    return out;
};

// SAFE
router.get('/', (req, res, next) => { // list all products route handler (uses an arrow function (to define an anonymous function))
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => { // execute the query
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the doughnuts!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: 'Qagh: 🛸 Our shelves are temporarily empty! The Galactic Doughnut Chefs are crafting new treats - please come back soon.',
                count: 0,
                galacticInventory: []
            });
        }
        const products = results.map(product => ({ // check product stock code (maps the products into an array for iteration)
            ...product, // keep all original columns - uses spread syntax to "spread" all key-value pairs from product object into products object
            price: '£' + product.price,
            stock: product.stock === 0 // shorthand if statement using conditional (ternary) operator (overwrites stock value from database)
                ? 'Qagh: 🚀 Sorry, this doughnut is currently out of stock in this galaxy!'
                : `🪐 ${product.stock} available for intergalactic delivery`
        }));
        // console.log('Retrieved products from the Intergalactic Menu:', products); // return data in console
        res.status(200).json({
            announcement: '🍩 Welcome to the Intergalactic Doughnut Delivery Service! Feast your eyes on our galactic menu.',
            count: products.length,
            galacticInventory: products
        });
    });
});

// VULNERABLE
router.post('/', (req, res, next) => { // create new product route handler
    const name = (req.body.name || '').toString().trim();
    const rawDescription = req.body.description || '';
    const rawPrice = req.body.price;
    const rawStock = req.body.stock;
    if(!name) {
        return res.status(400).json({
            announcement: 'Qagh: 🛸 The bakers require a name for this doughnut!'
        });
    }
    if(rawPrice === undefined || rawStock === undefined) {
        return res.status(400).json({
            announcement: 'Qagh: 🛸 Please provide both a price and stock count for this doughnut.'
        });
    }
    const price = Number(rawPrice);
    const stock = parseInt(rawStock, 10);
    if(!Number.isFinite(price) || price < 0 || price > 999999) { // check supplied price value is a finite number, and within a range
        return res.status(400).json({
            announcement: 'Qagh: 🚫 Invalid price value provided.'
        });
    }
    if(!Number.isInteger(stock) || stock < 0 || stock > 1000000) { // check supplied stock value is an integer, and within a range
        return res.status(400).json({
            announcement: 'Qagh: 🚫 Invalid stock value provided.'
        });
    }
    const description = challengeSanitise(rawDescription); // input sanitisation and validation for XSS protection
    const product = { // building the product object
        name,
        description,
        price,
        stock
    };
    const productCheckQuery = `SELECT COUNT(*) AS resultsCount FROM products WHERE name = ?`; // check if product with specified name already exists
    db.query(productCheckQuery, [product.name], (error, results) => { // check-then-insert
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem creating the doughnut!',
                details: error.sqlMessage
            });
        }
        const exists = (results && results[0] && results[0].resultsCount > 0); // product with specified name already exists
        if(exists) {
            return res.status(409).json({
                announcement: `Qagh: 🚫 A doughnut named ${product.name} already orbits this menu! Aborting creation.`
            });
        }
        setTimeout(() => { // set timeout for artificial delay - only set to help with race-condition exploit
            const query = `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`
            db.query(query, [product.name, product.description, product.price, product.stock], (error, results) => {
                if(error) {
                    console.error('Galactic database malfunction:', error.sqlMessage);
                    return res.status(500).json({
                        announcement: 'Qagh: ⚠️ Houston, we have a problem creating the doughnut!',
                        details: error.sqlMessage
                    });
                }
                res.status(201).json({
                    announcement: `✨ Doughnut ${product.name} created in the Intergalactic Menu!`,
                    spawnedDoughnutId: results.insertId
                });
            });
        }, 250); // 250ms delay
    });
});

// SAFE
router.get('/random', (req, res, next) => { // list a random product route handle
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the random doughnut!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: 'Qagh: 🛸 Our shelves are temporarily empty! The Galactic Doughnut Chefs are crafting new treats - please come back soon.',
                count: 0,
                galacticInventory: []
            });
        }
        const randomIndex = Math.floor(Math.random() * results.length);
        const product = results[randomIndex];
        const randomProduct = {
            ...product,
            price: '£' + product.price,
            stock: product.stock === 0
                ? 'Qagh: 🚀 Sorry, this doughnut is currently out of stock in this galaxy!'
                : `🪐 ${product.stock} available for intergalactic delivery`
        }
        // console.log('Retrieved random product from the Intergalactic Menu:', randomProduct.name); // return data in console
        res.status(200).json({
            announcement: '🔎 Your cosmic craving chooser has selected a random doughnut for you:',
            cosmicTreat: randomProduct
        });
    });
});

// VULNERABLE
router.get('/search', (req, res, next) => { // search for a product route handle
    const searchTerm = req.query.term; // pull value from 'term' URL parameter
    if(!searchTerm) {
        return res.status(400).json({
            announcement: 'Qagh: 🛸 The Search Satellites need a query! Please include ?term=your-flavour'
        });
    }
    const likeTerm = `%${searchTerm}%`; // required for partial matches
    const query = `SELECT * FROM products WHERE name LIKE '${likeTerm}' LIMIT 10`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the searched doughnut!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: `Qagh: 🔎 You searched for ${searchTerm}... The bakers report no matches in this sector.`,
                count: 0,
                galacticInventory: []
            });
        }
        // console.log('Retrieved product from the Intergalactic Menu:', results); // return data in console
        res.status(200).json({
            announcement: `🔎 You searched for ${searchTerm} (may include interstellar surprises)`,
            count: results.length,
            galacticInventory: results
        });
    });
});

// SAFE
router.get('/:productId', (req, res, next) => { // view a specific product route handle
    const productId = parseInt(req.params.productId, 10); // parse supplied productId as integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-Number (input validation) or less then/equal to 0, error
        return res.status(400).json({
            announcement: 'Qagh: 🚫 Invalid doughnut identifier! Please supply a positive numeric id.'
        });
    }
    const query = `SELECT * FROM products WHERE id = ?`; // parameterized (prepared) query
    db.query(query, [productId], (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the specific doughnut!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: `Qagh: 🔎 The bakers report no doughnut with id ${productId} in this sector.`,
                count: 0,
                galacticInventory: []
            });
        }
        const product = results.map(item => ({
            ...item,
            price: '£' + item.price,
            stock: item.stock === 0
                ? 'Qagh: 🚀 Sorry, this doughnut is currently out of stock in this galaxy!'
                : `🪐 ${item.stock} available for intergalactic delivery`
        }));
        // console.log('Retrieved product from the Intergalactic Menu:', product); // return data in console
        res.status(200).json({
            announcement: `🔎 Found doughnut #${productId}! Enjoy the details...`,
            count: product.length,
            galacticInventory: product
        });
    });
});

// SAFE
router.patch('/:productId', (req, res, next) => { // update a product route handle
    const productId = parseInt(req.params.productId, 10); // pull the productId from the URL parameters using the params object - parse it as an integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-number or equal to 0, return error
        return res.status(400).json({
            announcement: `Qagh: 🚫 Invalid doughnut identifier specified!`
        });
    }
    if(!req.body || Object.keys(req.body).length === 0) { // if request body is empty, return error
        return res.status(400).json({ 
            announcement: `Qagh: 🚫 Please provide doughnut details!`
        });
    }
    const allowedParameters = ['name', 'description', 'price', 'stock']; // allowlist
    const updates = {};
    const params = []; // params array to store 'updates' property values to SQL query - parameterised query
    function htmlEscape(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\//g, '&#x2F;');
    }
    for(const key of allowedParameters) { // iterate over the allowlist values
        if(Object.prototype.hasOwnProperty.call(req.body, key)) { // check the request body's own properties, not anything inherited from its prototype chain
            const value = req.body[key];
            if(key === 'price') {
                const p = Number(value); // store price in p constant
                if(!Number.isFinite(p) || p < 0 || p > 999999) {
                    return res.status(400).json({
                        announcement: `Qagh: 🚫 Invalid doughnut price.`
                    });
                }
                updates[key] = p.toFixed(2); // price to 2 decimal places
            } else if(key === 'stock') {
                const s = parseInt(value, 10);
                if(!Number.isInteger(s) || s < 0 || s > 1000000) {
                    return res.status(400).json({
                        announcement: `Qagh: 🚫 Invalid stock value.`
                    });
                }
                updates[key] = s;
            } else if(key === 'name' || key === 'description') {
                const o = String(value).trim();
                if(key === 'name' && (o.length === 0 || o.length > 255)) { // max character set to 100 at DB level, so this logic should never run
                    return res.status(400).json({
                        announcement: `Qagh: 🚫 Doughnut name must be 1-255 characters.`
                    });
                }
                if(key === 'description' && o.length > 2000) {
                    return res.status(400).json({
                        announcement: `Qagh: 🚫 Doughnut description too long.`
                    });
                }
                updates[key] = htmlEscape(o);
            }
            params.push(updates[key]); // push the updates object's properties to the params array for parameterised SQL query
        }
    }
    if(Object.keys(updates).length === 0) { // mitigates mass-assignment! Returns an array of the updates object's property names - error if empty (i.e. not in the allowlist)
        return res.status(400).json({
            announcement: `Qagh: 🚫 No valid fields to update.`
        });
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    params.push(productId);
    const query = `UPDATE products SET ${setClause} WHERE id = ?`;
    db.query(query, params, (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the specific doughnut!',
                details: error.sqlMessage
            });
        }
        if(!results || results.affectedRows === 0) {
            return res.status(200).json({
                announcement: `Qagh: 🔎 The bakers report no doughnut with id ${productId} in this sector.`,
                count: 0,
                galacticInventory: []
            });
        }
        // Return canonical updated row
        const selectSql = `SELECT id, name, description, price, stock FROM products WHERE id = ?`;
        db.query(selectSql, [productId], (selErr, rows) => {
            if(selErr) {
                console.error('Galactic database malfunction:', error.sqlMessage);
                return res.status(500).json({
                    announcement: 'Qagh: ⚠️ Houston, we have a problem retrieving the specific doughnut!',
                    details: selErr.sqlMessage
                });
            }
            const product = rows[0];
            product.price = typeof product.price === 'number'
                ? Number(product.price.toFixed(2))
                : Number(parseFloat(product.price).toFixed(2));
            res.status(200).json({
                announcement: `✨ Doughnut #${productId} updated successfully!`,
                product
            });
        });
    });
});






// SAFE
router.delete('/:productId', (req, res, next) => { // delete a product route handle
    const productId = parseInt(req.params.productId, 10); // parse supplied productId as integer
    if(Number.isNaN(productId) || productId <= 0) { // if Not-a-Number (input validation) or less then/equal to 0, error
        return res.status(400).json({
            announcement: 'Qagh: 🚫 Invalid doughnut identifier! Please supply a positive numeric id.'
        });
    }
    const query = `DELETE FROM products WHERE id= ?`; // parameterized (prepared) query
    db.query(query, [productId], (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: 'Qagh: ⚠️ Houston, we have a problem deleting that doughnut!',
                details: error.sqlMessage
            });
        }
        if(results.affectedRows === 0) { // no rows deleted
            return res.status(200).json({
                announcement: `Qagh: 🔎 The bakers report no doughnut with id ${productId} in this sector! Nothing was deleted.`,
                vaporisedDoughnut: "none"
            });
        }
        // console.log('Deleted product from the Intergalactic Menu:', results); // return data in console
        res.status(200).json({
            announcement: `💫 Farewell doughnut #${productId}, live long and prosper!`,
            vaporisedDoughnut: productId
        });
    });
});

module.exports = router;