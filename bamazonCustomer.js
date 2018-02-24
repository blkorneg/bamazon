//imports require
var mysql     = require('mysql');
var inquirer  = require("inquirer");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'bamazon'
});

//Establish DB connection
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//Show availabe product
let sql = `SELECT * FROM products`;
con.query(sql, (error, results, fields) => {
  if (error) {
    return console.error(error.message);
  }

  Object.keys(results).forEach(function(key) {
    var row = results[key];
    console.log(row.item_id+"   "+ row.product_name +"        "+ row.price);

  });
});

//Ask customer to select item and quantity to purchase
inquirer
  .prompt([
    {
      type: "input",
      message: "Enter the ID of the product you would like to buy?",
      name: "id"
    },
    {
      type: "input",
      message: "How may pair of sneaker would you like:",
      name: "quantity"
    }
  ]) //
  .then(function(inquirerResponse) { //Prepare for shipment
    let sqlQtyChk = 'select stock_quantity, price from products where item_id = ' + inquirerResponse.id ;

    con.query(sqlQtyChk, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }

      Object.keys(results).forEach(function(key) {
        var row = results[key];

        var resultQty = row.stock_quantity;
        var price     = row.price
        shipmentExecution(resultQty,inquirerResponse.quantity,price,inquirerResponse.id );

      });
    });

  });

  //TODO Add move validation and exeception handling and add more intelligence
  //Notifiy if order can't be fulfill other with ship order
  function shipmentExecution(instockQty, desireQty, price, id) {
    if (desireQty > instockQty) {
        console.log("Sorry insufficient quantity! We have " + instockQty + " in stock.")
    } else {

      let sql = `update products set stock_quantity = ` + parseInt(instockQty - desireQty) + ' where item_id = ' + id;
      con.query(sql, (error, results, fields) => {
        if (error) {
          return console.error(error.message);
        }
        console.log("Database updated");
      });
      console.log("Your Total: " + price * desireQty + " Your order has been shipped");
    }

  }
