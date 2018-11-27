DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE `products` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(45) NOT NULL,
  `department_name` varchar(45) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(10) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
)