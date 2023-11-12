const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

app.use(cors());


//Creating a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'supershop',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});


//Login 
app.post('/api/login', (req, res) => {
    console.log("1")
    const { username, password } = req.body;


    // Checking if the username and password are provided
    if (username.length === 0 || password === 0) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    console.log("1")

    // Checking if the user exists in the database
    const sql = 'SELECT * FROM users WHERE User_Name = ? AND User_Password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error.' });
        }

        // If the user with the provided username doesn't exist
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }


        //Generate a JWT token and send it as a response
        const token = jwt.sign({ username: username, role: 'admin' }, secretKey, { expiresIn: '1h' });
        return res.status(200).json({ token: token });


    });
});

// signup

app.post('/api/signup', (req, res) => {
    const { username, useremail, password } = req.body;

    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if the username is already taken
    const checkUserSql = 'SELECT * FROM adminInfo WHERE User_Name = ?';
    db.query(checkUserSql, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error.' });
        }

        // If the username is already taken
        if (results.length > 0) {
            return res.status(409).json({ error: 'Username is already taken.' });
        }

        // Insert the new user into the database
        const insertUserSql = 'INSERT INTO adminInfo (User_Name, User_Email, User_Password) VALUES (?, ?, ?)';
        db.query(insertUserSql, [username, useremail, password], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error.' });
            }

            return res.status(201).json({ message: 'User created successfully.' });
        });
    });
});


//Displaying the sales table
app.get('/api/salesTable', (req, res) => {
    const sql = 'SELECT * FROM sales';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});
//Displaying the supplier table

app.get('/api/suppliers', (req, res) => {
    const sql = 'SELECT * FROM suppliers';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});


app.post('/api/warehouseUpdate', (req, res) => {

    const { name, quantity } = req.body;

    const sqlQuery = `Update warehouse SET Current_Availability = Current_Availability + ? WHERE ProductID = (SELECT products.ProductID FROM products WHERE products.Name = ?)`;

    db.query(sqlQuery, [quantity, name], (err, result) => {
        if (err) {
            console.log(30);

            console.error('Could not update the warehouse' + err);
            return res.status(500).json({ error: 'Internal server error' });

        }
        return res.status(201).json({ message: `Warehouse updated` })
    });

});

//Displaying the warehouse table
app.get('/api/warehouse', (req, res) => {

    const sql = 'SELECT products.Name, warehouse.Current_Availability FROM products JOIN warehouse ON products.ProductID = warehouse.ProductID;';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});

//Displaying the Products

app.get('/api/products', (req, res) => {

    const sql = 'SELECT products.ProductID, products.Name, (SELECT categories.CategoryName FROM categories WHERE products.CategoryID = categories.CategoryID) AS Category, (SELECT suppliers.SupplierName FROM suppliers WHERE products.SupplierID = suppliers.SupplierID) AS Supplier, products.ExpiryDate, products.Price FROM products';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});


//Getting all the product names

app.get('/api/getProducts', (req, res) => {
    const sql = 'SELECT Name FROM products';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});

app.post('/api/getCategoryProducts', (req, res) => {
    const { category } = req.body;

    const sql = 'SELECT products.Name FROM products WHERE products.CategoryID = (SELECT categories.CategoryID FROM categories WHERE categories.CategoryName = ?)'

    db.query(sql, [category], (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});



//Getting all the category names

app.get('/api/getCategory', (req, res) => {
    const sql = `SELECT CategoryName FROM categories`;


    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});

// Getting the unit price of a product
app.post('/api/getUnitPrice', (req, res) => {
    const { name } = req.body;

    const query = 'SELECT Price FROM products WHERE  Name = ?';

    db.query(query, [name], (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    })
})
//Getting all the supplier names

app.get('/api/getSupplier', (req, res) => {
    const sql = `SELECT SupplierName FROM suppliers`;


    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing the query: ' + err.stack);
            return res.status(500).send('Error retrieving data from the database.');
        }

        res.json(results);
    });
});

//  Register new supplier

app.post('/suppliers/register', (req, res) => {


    const { supplierName, contactInfo, Address } = req.body;

    console.log(60);
    if (!supplierName || !contactInfo || !Address) {
        return res.status(400).json({ message: 'all fields are required' });
    }

    // inserting into supplier table

    const checkSupplierExists = 'Select * FROM suppliers WHERE ContactInfo = ?';

    db.query(checkSupplierExists, [contactInfo], (err, result) => {
        console.log(65);

        if (err) {
            return res.status(500).json({ error: 'Internal server error' });

        }

        if (result.length > 0) {
            return res.status(409).json({ message: 'This contact number already exists' });
        }

        else {

            console.log(69);

            const insertIntoSupplierQuery = 'INSERT INTO suppliers(SupplierName, ContactInfo, Address) VALUES (?, ?, ?)';

            db.query(insertIntoSupplierQuery, [supplierName, contactInfo, Address], (err, result) => {

                if (err) {

                    console.error('Error registering new supplier: ' + err);
                    return res.status(500).json({ error: 'Internal server error' });

                }

                return res.status(201).json({ message: 'Supplier registered successfully' });
            });
        }

    });


});





app.post('/categories', (req, res) => {

    const { category } = req.body;

    const checkCategoryExists = 'Select * FROM categories WHERE CategoryName = ?'

    db.query(checkCategoryExists, [category], (err, result) => {

        if (err) {
            console.error('Error inserting new product: ' + err);
            return res.status(500).json({ error: 'Internal server error' });

        }

        if (result.length > 0) {

            res.status(400).json({ message: 'Category already registered' });
        }

        else {

            console.log(70);
            const insertIntoCategoryQuery = 'INSERT INTO categories(CategoryName) VALUES (?)';
            db.query(insertIntoCategoryQuery, [category], (err, result) => {

                if (err) {
                    console.error('Error inserting new category: ' + err);
                    return res.status(500).json({ error: 'Internal server error' });

                }

                res.status(201).json({ message: 'Category added successfully' });
            });
        }

    });
});



app.post('/products', (req, res) => {



    const { name, category, supplierName, expiryDate, quantity, price } = req.body;


    //Does Product Exists???

    const checkProductExists = 'Select * FROM products WHERE Name = ?'

    db.query(checkProductExists, [name], async (err, result) => {

        if (err) {

            console.log(20);

            console.error('Error inserting new product: ' + err);
            return res.status(500).json({ error: 'Internal server error' });

        }

        if (result.length > 0) {

            // Updating the current availability of the existing product


            return res.status(401).json({ message: "This Product already exists" });
        }

        else {

            // Registering new product


            // First getting the category id

            const getCategoryIdQuery = 'SELECT CategoryID FROM categories WHERE CategoryName = ?';


            db.query(getCategoryIdQuery, [category], (err, result) => {
                if (err) {
                    console.log(40);
                    return res.status(500).json({ error: 'Internal server error' });
                }


                const categoryID = result[0].CategoryID;
                console.log(categoryID);



                //Now fetching the supplier id


                const getSupplierIdQuery = 'SELECT SupplierID FROM suppliers WHERE SupplierName = ?';


                db.query(getSupplierIdQuery, [supplierName], (err, result) => {
                    if (err) {
                        console.log(45);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const supplierID = result[0].SupplierID;
                    console.log(supplierID);



                    //finally inserting data into the products table

                    const insertIntoProductQuery = 'INSERT INTO products(Name, CategoryID, SupplierID, Price, ExpiryDate) VALUES (?, ?, ?, ?, ?)';

                    // console.log(SupplierID);
                    // console.log(CategoryID);

                    db.query(insertIntoProductQuery, [name, categoryID, supplierID, price, expiryDate], (err, result) => {


                        if (err) {
                            console.log(50);
                            console.error('Error inserting new product: ' + err);
                            return res.status(500).json({ error: 'Internal server error' });

                        }


                        //Updating Warehouse

                        const pidQuery = 'SELECT ProductID FROM products WHERE Name = ?';

                        db.query(pidQuery, [name], (err, result) => {

                            if (err) {
                                console.log(55);
                                console.error('Error inserting new product: ' + err);
                                res.status(500).json({ error: 'Internal server error' });
                                return;
                            }

                            //inserting product id and Curr_Avail to the warehouse

                            const getProductID = result[0].ProductID;
                            const insertToWarehouseQuery = 'INSERT INTO warehouse VALUES (?, ?)';

                            db.query(insertToWarehouseQuery, [getProductID, quantity], (err, result) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Internal server error' });
                                }
                            });

                        });

                    });
                });

            });


            return res.status(201).json({ message: 'Product added successfully' });
        }

    });

});


app.post('/api/invoice', (req, res) => {

    let ProductID;
    const { trID, name, quantity } = req.body;

    // check if warehouse has the requested amount or not

    const sqlQueryPID = 'SELECT ProductID FROM products WHERE Name = ?';

    db.query(sqlQueryPID, [name], (err, results) => {
        if (err) {

            return res.status(500).json({ error: 'innie' });

        }


        ProductID = results[0].ProductID;

        const sqlQueryQuan = 'SELECT Current_Availability FROM warehouse WHERE ProductID = ?';

        db.query(sqlQueryQuan, [results[0].ProductID], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'minnie' });

            }
            // console.log(results[0].Current_Availability);

            // console.log(quantity);

            if (quantity <= results[0].Current_Availability) {

                const checksql = 'SELECT * FROM sales WHERE TransactionID = ?';
                db.query(checksql, [trID], (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'boom' });

                    }

                    if (results.length === 0) {
                        const insertInSales = 'INSERT INTO sales(TransactionID) VALUES (?)';
                        db.query(insertInSales, [trID], (err, results) => {
                            if (err) {
                                return res.status(500).json({ error: 'miney' });

                            }
                        });

                    }

                    console.log(56);
                    const invoiceQuery = 'INSERT INTO transactiondetails(TransactionID, ProductID, Quantity) VALUES (?, ?, ?)';

                    db.query(invoiceQuery, [trID, ProductID, quantity], (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: 'moe' });

                        }
                        return res.status(201).json({ message: "Invoice updated" });
                    });

                });

                // res.json();



            }

            else {
                return res.status(400).json({ message: "We don't have the selected product in pur warehouse in given quantity" });
            }
        });


    });

});

app.post('/api/sales/:trId', (req, res) => {

    const trID = req.params.trId;

    const { amount } = req.body;

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}-${month}-${day}`;
    // console.log(currentDate); // "17-6-2022"
    const salesQuery = 'UPDATE sales SET TransactionDate = ?, Amount = ? WHERE TransactionID = ?';
    db.query(salesQuery, [currentDate, amount, trID], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

    });

});
//  Calculate sales and update sales records

// app.post('/sales', (req, res) => {
//     const { productName, quantity } = req.body;

//     // Calculate total payable amount
//     let totalAmount = 0;
//     let curr = 0;

//     let productID = 0;

//     let unitPrice = 0;



//     // check if the product is registered or not
//     const productQuery = 'Select ProductID from products where Name = ?';

//     db.query(productQuery, [productName], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: 'Internal Server Error' });
//         }


//         if (result.length > 0) {
//             //return true;
//             productID = result[0].ProductID;

//             console.log(productID);

//             const quantityQuery = 'Select Current_Availability from warehouse where ProductID = ?';

//             db.query(quantityQuery, [productID], (err, result) => {
//                 if (err) {
//                     return res.status(500).json({ message: 'Internal Server Error' });
//                 }


//                 curr = result[0].Current_Availability;

//                 console.log(curr);

//                 // if (result.length > 0) {
//                 // }
//             });
//             //res.status(200).json({message: ""})
//             if (curr < quantity) {
//                 return res.status(301).json({ message: 'invalid input' });
//             }

//             else {
//                 const getUnitPriceQuery = 'SELECT Price FROM products WHERE Name = ?';

//                 db.query(getUnitPriceQuery, [productName], (err, result) => {
//                     if (err) {
//                         return res.status(500).json({ message: 'Internal Server Error' });
//                     }

//                     unitPrice = result[0].Price;
//                     console.log(unitPrice);
//                 })

//                 totalAmount = quantity * unitPrice;
//             }

//         }

//         else {
//             return res.status(401).json({ message: "Product not found" });
//         }

//         //checking if it is available or not

//     });




//     // Iterate through the products and calculate the total amount
//     /*

//     for (const product of products) {
//         const { productId, quantity } = product;

//         // Fetch product price from the database
//         const getProductQuery = 'SELECT price FROM Products WHERE id = ?';
//         db.query(getProductQuery, [productId], (err, result) => {
//             if (err) {
//                 console.error('Error fetching product price: ' + err);
//                 res.status(500).json({ error: 'Internal server error' });
//                 return;
//             }

//             if (result.length === 0) {
//                 res.status(404).json({ error: 'Product not found' });
//                 return;
//             }

//             const productPrice = result[0].price;
//             totalAmount += productPrice * quantity;

//             // Check if the requested quantity is available
//             // You should have a mechanism to track product stock and update it here
//             // If there's not enough stock, you can send an appropriate response
//             // and handle stock management accordingly.

//             // Update the Sales and TransactionDetails tables
//             const insertSalesQuery = 'INSERT INTO Sales (customerId, totalAmount) VALUES (?, ?)';
//             db.query(insertSalesQuery, [customerId, totalAmount], (err, result) => {
//                 if (err) {
//                     console.error('Error inserting sales record: ' + err);
//                     res.status(500).json({ error: 'Internal server error' });
//                     return;
//                 }

//                 const salesId = result.insertId;

//                 // Insert each product into TransactionDetails
//                 const insertTransactionDetailsQuery = 'INSERT INTO TransactionDetails (salesId, productId, quantity) VALUES (?, ?, ?)';
//                 db.query(insertTransactionDetailsQuery, [salesId, productId, quantity], (err) => {
//                     if (err) {
//                         console.error('Error inserting transaction details: ' + err);
//                         res.status(500).json({ error: 'Internal server error' });
//                         return;
//                     }
//                 });
//             });
//         });
//     }
//     */
//     res.status(200).json({ message: 'Sales recorded successfully', totalAmount });
// });



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
