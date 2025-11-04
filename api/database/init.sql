-- --------------------------------------------------------
--
-- database: `idds`
--
DROP DATABASE IF EXISTS idds;
CREATE DATABASE idds;
USE idds;

-- Create `idds_user` DB user
DROP USER IF EXISTS 'idds_user'@'localhost';
CREATE USER 'idds_user'@'localhost' IDENTIFIED BY 'idds_pass';
GRANT ALL PRIVILEGES ON idds.* TO 'idds_user'@'localhost';
FLUSH PRIVILEGES;

-- --------------------------------------------------------
--
-- table structure for `users` table
--
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    uuid CHAR(36) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') NOT NULL DEFAULT 'user'
);

/*-- seed users
INSERT INTO users (username, uuid, password, role) VALUES
    ('admin', '', 'root', 'admin'),
    ('alice', '', 'alice123', 'user'),
    ('bob', '', 'bob123', 'user');*/

-- --------------------------------------------------------
--
-- table structure for `products` table
--
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(6,2) NOT NULL,
    stock INT DEFAULT 50
);

-- seed products
INSERT INTO products (name, description, price, stock) VALUES
    ('Cosmic Glaze', 'A shimmering doughnut coated in stardust glaze that tastes like vanilla and nebula sugar.', 2.99, 25),
    ('Black Hole Crunch', 'Dense chocolate doughnut so dark it bends light - filled with molten fudge core.', 3.49, 15),
    ('Galactic Sprinkle', 'Classic doughnut topped with colorful asteroid sprinkles from the Andromeda Belt.', 2.49, 30),
    ('Alien Goo Jelly', 'Green ooze-filled doughnut that glows faintly in the dark - lime flavor, allegedly safe for humans.', 3.29, 20),
    ('Milky Way Maple', 'Maple-flavored doughnut infused with cosmic caramel sourced from Milky Way syrup mines.', 2.89, 40),
    ('Neutron Star Cruller', 'Crunchy on the outside, impossibly dense inside. Not responsible for gravitational anomalies.', 3.99, 10);

/*-- --------------------------------------------------------
--
-- table structure for `orders` table
--
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- foreign key constraints
    CONSTRAINT fk_orders_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

    CONSTRAINT fk_orders_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
);*/