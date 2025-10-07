-- --------------------------------------------------------
--
-- Database: `idds`
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
-- Table structure for `products` table
--
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(6,2) NOT NULL,
    stock INT DEFAULT 50
);

-- Seed products
INSERT INTO products (name, description, price, stock) VALUES
  ('Cosmic Glaze', 'A shimmering doughnut coated in stardust glaze that tastes like vanilla and nebula sugar.', 2.99, 25),
  ('Black Hole Crunch', 'Dense chocolate doughnut so dark it bends light - filled with molten fudge core.', 3.49, 15),
  ('Galactic Sprinkle', 'Classic doughnut topped with colorful asteroid sprinkles from the Andromeda Belt.', 2.49, 30),
  ('Alien Goo Jelly', 'Green ooze-filled doughnut that glows faintly in the dark - lime flavor, allegedly safe for humans.', 3.29, 20),
  ('Milky Way Maple', 'Maple-flavored doughnut infused with cosmic caramel sourced from Milky Way syrup mines.', 2.89, 40),
  ('Neutron Star Cruller', 'Crunchy on the outside, impossibly dense inside. Not responsible for gravitational anomalies.', 3.99, 10);