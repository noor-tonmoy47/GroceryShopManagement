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


//  Register new product

app.post('/suppliers/register', (req, res) => {


    const { supplierName, contactInfo, Address } = req.body;

    console.log(60);


    // inserting into supplier table

    const checkSupplierExists = 'Select * FROM suppliers WHERE SupplierName = ? AND ContactInfo = ? AND Address = ?';

    db.query(checkSupplierExists, [supplierName, contactInfo, Address], (err, result) => {
        console.log(65);

        if (err) {
            console.error('Error inserting new product: ' + err);
            return res.status(500).json({ error: 'Internal server error' });

        }

        if (result.length > 0) {
            res.status(400).json({ message: 'Supplier already registered' });
        }

        else {

            console.log(69);

            const insertIntoSupplierQuery = 'INSERT INTO suppliers(SupplierName, ContactInfo, Address) VALUES (?, ?, ?)';

            db.query(insertIntoSupplierQuery, [supplierName, contactInfo, Address], (err, result) => {

                if (err) {

                    console.error('Error registering new supplier: ' + err);
                    return res.status(500).json({ error: 'Internal server error' });

                }

                res.status(201).json({ message: 'Supplier registered successfully' });
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



    const { name, supplierName, category, price, quantity, expiryDate } = req.body;


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

            const pidQuery = 'SELECT ProductID FROM products WHERE Name = ?';

            db.query(pidQuery, [name], (err, result) => {

                if (err) {
                    console.log(25);


                    console.error('An Error occured: ' + err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const addQuery = 'Update warehouse SET Current_Availability = Current_Availability + ? WHERE ProductID = ?';

                db.query(addQuery, [quantity, result[0].ProductID], (err, result) => {
                    if (err) {
                        console.log(30);

                        console.error('Could not update the warehouse' + err);
                        res.status(500).json({ error: 'Internal server error' });
                        return;
                    }

                });



            });


            return res.status(201).json({ message: "Warehouse updated successfully" });
            //res.status(400).json({ message: 'Product already exists' });



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
