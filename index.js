var express = require('express');
var path = require('path');
var ejs = require('ejs');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_project"
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(4000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secret" }));

function isProductInCart(cart, id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false;
}

function calculateTotal(cart, req) {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + (cart[i].price * cart[i].stock);
    }
    req.session.total = total;
    return total;
}

app.get(['/', '/home', '/whatever/*'], function (req, res) {
    

    con.query("SELECT * FROM product", (err, result) => {
        if (err) throw err;
        res.render('pages/index', { result: result });
    });
});

app.get('/shop', function (req, res) {
    

    con.query("SELECT * FROM product", (err, result) => {
        if (err) throw err;
        res.render('pages/shop', { result: result });
    });
});


app.get('/shopchair', function (req, res) {
    
    var chair = 'chair';
    con.query("SELECT * FROM product WHERE category = ?", [chair], (err, result) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.render('pages/shop', { result: result });
    });
});

app.get('/shopsofa', function (req, res) {
    
    var sofa = 'sofa';

    con.query("SELECT * FROM product WHERE category = ?",[sofa], (err, result) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.render('pages/shop', { result: result });
    });
});

app.get('/shoptable', function (req, res) {
    
    var table = 'table';

    con.query("SELECT * FROM product WHERE category = ?",[table], (err, result) => {
        if (err) throw err;
        res.render('pages/shop', { result: result });
    });
});

app.post('/add_to_cart', function (req, res) {

    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var stock = req.body.stock;
    var price = req.body.price;
    var image = req.body.image;

    console.log(id);


    // var product = { id: id, name: name, description: description, stock: stock, price: price, image: image };

    // if (req.session.cart) {
    //     var cart = req.session.cart;

    //     if (!isProductInCart(cart, id)) {
    //         cart.push(product);
    //     }
    // } else {
    //     req.session.cart = [product];
    //     var cart = req.session.cart;
    // }

    // // Calculate total
    // calculateTotal(cart, req);

    // // Return to cart
    // res.redirect('/cart');
});

//changes in cart from database

app.get('/checkout', function(req,res){
    res.render('pages/checkout');
})
app.get('/cart', function (req, res) {
    con.query("SELECT * FROM product", (err, result) => {
        if (err) throw err;
        res.render('pages/cart', { result: result });
    });
});

app.get('/about', function (req, res) {
    res.render('pages/about');
});


app.get('/contact', function(req, res) {
    try {
        res.render('pages/contact');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/sendemail',sendMail)
// app.post('/contact', async function(req, res){
//     var fname = req.body.fname;
//     var lname = req.body.lname;
//     var email = req.body.email;
//     var  message= req.body.message;
    

//     var transporter = nodemailer.createTransport({
//        service: 'gmail',
//         auth: {
//             user: "rabiahbmalik108@gmail.com",
//             pass: "rabianew16",
//         },
//     });

    
//     var mailoptions = {
//         fname : fname,
//         lname : lname,
//         email : email,
//         message : message
//     }
//     console.log(fname);
//     console.log(lname);
//     console.log(email);
//     console.log(message);
//     transporter.sendMail(mailoptions , function(error , info){
//         if(error)
//         {
//             console.log(error);
//         }
//         else{
//             console.log("Email Send: ", info.response);
//         }
//         res.render('pages/contact');
//     })
// });

app.get('/login' , function(req,res){

    res.render('pages/login');
})
//get the info from the login page
app.post('/login', function(req, res) {
    var uname = req.body.username;
    var pass = req.body.password;

    con.query("SELECT username FROM accounts as a WHERE a.username = ? AND a.password = ?", [uname, pass], (err, result) => {
        if (err) {  
            console.error('Error checking username and password:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            // Valid username and password
            console.log("Login successful");
            res.send('Login successful');
            res.redirect('pages/index');
            // You can redirect to the desired page after successful login
            // res.redirect('/dashboard');
        } else {
            // Invalid username or password
            console.log("Invalid username or password");
            res.send('Invalid username or password');
        }
    });
});


//render the register page if dont have an account 
app.get('/register' , function(req,res){

    res.render('pages/register');
})


app.post('/register', function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    console.log(username, email, password);
    
    con.query('INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)',[username,email,password], (err, result) => {
        if (err) {
            console.error('Error creating account:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        
        console.log("Account successfully created");

        // Add a delay of 3 seconds using setTimeout
        setTimeout(() => {
            res.send('Account successfully created');
            res.render('pages/login');
        }, 3000);
    });
});

app.get('/services', function(req,res){
    res.render('pages/services');
})
