//on run display all the items in the store, then it asks 2 questions(inquirer.prompt([])) what item would you like to buy? then how many?
//then check to see if there are enough products left,if not, alert the customer.
//if there is enough quantity, update the sql database (subtract their order amount), then show them their total.
const mysql = require('mysql');
const inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    showProducts();
});

//total cost of purchase
var cartTotal = 0;

stockAdjust= (val, prod)=>{
    var prodQuan;
    var query = connection.query(
        "SELECT stock_quantity, price FROM products WHERE ?",
        {
           product_name: prod
        },
        function(err, res){
            if (err) throw err;

            console.log(`product quantity: ${res[0].stock_quantity}`)
            prodQuan = (res[0].stock_quantity - val)
            if(prodQuan >! res[0].stock_quantity){
                cartTotal += res[0].price
                var query = connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: prodQuan
                        },
                        {
                            product_name: prod
                        }
                    ],
                    function(err, res) {
                        // console.log(res)
                        showProducts();
                    }
                )
            } else{
                console.log(`~*~NOT ENOUGH STOCK~*~`);
                showProducts();
            }
        }  
    )
};

showProducts = () =>{
    var query = connection.query(
        "SELECT product_name, price, stock_quantity FROM products",
        function(err, res){
            if (err) throw err;
            res.forEach(each => {
                console.log('=====================================')
                console.log(`Item: ${each.product_name}`)
                console.log(`Price: $${each.price}`)
                console.log(`Stock left: ${each.stock_quantity} remaining`)
                
            });

            customerQuestion();
            // connection.end();
        }
    )
};

customerQuestion = () =>{
    inquirer.prompt([
        {
            type: 'input',
            name:'purchase',
            message: 'Which product would you like to purchase?', 
        },
        {
            type: 'input',
            name:'quantity',
            message: 'How many would you like to purchase?',
        }
    ]).then(ans =>{
       
       stockAdjust(ans.quantity, ans.purchase)
       
    })
}



