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
    promptGuest();
});

//total cost of purchase
var cartTotal = 0;

promptGuest = () => {
    inquirer.prompt([
        {
            type: 'rawlist',
            message: 'WELCOME! SELECT ROLE',
            name: 'role',
            choices: ['manager', 'guest']
        }
    ]).then(ans => {
        if(ans.role === 'manager'){
            manager();
        }
        if(ans.role === 'guest'){
            customerQuestion();
        }

    })
};

manager = () =>{
    inquirer.prompt([
        {
            type:'rawlist',
            message:'Welcome Manager',
            name: 'select',
            choices: ['view products', 'view low inventory', 'add to inventory', 'add new products', 'exit']
        }
    ]).then(ans =>{
        switch (ans.select){
            case 'view products':
                showProducts();
                manager();
                break;
            case 'view low inventory':
                manLowInv();
                break;
            case 'add to inventory':
                manAddInv();
                break;
            case 'add new products':
                manNewProd();
                break;
            case 'exit':
                console.log('have a nice day!')
                connection.end();
                break;

        }
    });
};

manLowInv = () =>{
var query = connection.query(
    "SELECT product_name, price, stock_quantity FROM products WHERE stock_quantity <= 5",
    function(err, res){
        if (err) throw err;
        res.forEach(each => {
            console.log('=====================================')
            console.log(`Item: ${each.product_name}`)
            console.log(`Price: $${each.price}`)
            console.log(`Stock left: ${each.stock_quantity} remaining`)

            inquirer.prompt([
                {
                    type: 'confirm',
                    message: 'Add to Inventory?',
                    name: 'inv'
                }
            ]).then(ans =>{
                if(ans.inv){
                    manAddInv();
                }else manager();
            })
            
        });
    }
)

};

manAddInv = () =>{

    inquirer.prompt([
        {
            type: 'input',
            name: 'item',
            message: 'What item would you like to re-stock?',
        },
        {
            type: 'input',
            name: 'quan',
            message: 'How many would you like to add?'
        }
    ]).then(ans =>{
        var prodQuan;
        var query = connection.query(
            "SELECT stock_quantity, price FROM products WHERE ?",
            {
               product_name: ans.item
            },
            function(err, res){
                if (err) throw err;
                prodQuan = (res[0].stock_quantity + ans.quan)
                var query = connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: prodQuan
                        },
                        {
                            product_name: ans.item
                        }
                    ],
                    function(err, res) {
                        console.log(`${res.affectedRows} products Re-stocked!`)
                        manager();
                    }
                )
            }
        )
    });
}; 

manNewProd = () =>{
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new item?' ,
            name: 'item', 
        },
        {
            type: 'input',
            message: 'How many would youy like to add?' ,
            name: 'quan', 
        },
        {
            type: 'input',
            message: 'What departent does this belong too?',
            name: 'department' , 
        },
        {
            type: 'input',
            message: 'What is the cost per item?',
            name: 'cost', 
        }
    ]).then(ans =>{
        var query = connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: ans.item,
                stock_quantity: ans.quan,
                department_name: ans.department,
                price: ans.cost,
            },
            function(err, res) {
                console.log(`${res.affectedRows} product added`)
                manager()
            }
        )
    })
};

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

                cartTotal += (res[0].price * val).toFixed(2)
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
                       checkoutPrompt();
                    }
                )
            } 
            
            else{
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
        }
    )
};

checkoutPrompt = () => {
    console.log(`Cart  Total: $${cartTotal}`)
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'shop',
            message: 'Keep Shopping?'
        }
    ]).then(ans =>{
        if(ans.shop){
            showProducts();
        }else{
            console.log(`Total Cost: $${cartTotal}`)
            console.log('========================')
            console.log('THANK YOU FOR SHOPPING, COME AGAIN')
            connection.end();
        }
    });

}

customerQuestion = () =>{
    showProducts();
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


