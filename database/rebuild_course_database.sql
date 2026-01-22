--- =============================================
-- Rebuild Course Database Script
-- =============================================

-- 1) Drop existing objects (in correct order)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TYPE IF EXISTS account_type_enum CASCADE;

-- 2) Create type
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin');

-- 3) Create tables
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  account_type account_type_enum DEFAULT 'Client'
);

CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);

CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_description TEXT,
  inv_image VARCHAR(255),
  inv_thumbnail VARCHAR(255),
  classification_id INT REFERENCES classification(classification_id)
);

-- 4) Insert seed data
INSERT INTO classification (classification_name)
VALUES
  ('SUV'),
  ('Truck'),
  ('Sport'),
  ('Sedan');

INSERT INTO inventory (
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  classification_id
)
VALUES
  ('GM', 'Hummer', 'large vehicle with small interiors', '/images/hummer.jpg', '/images/hummer-thumb.jpg', 1),
  ('Ford', 'F-150', 'strong build and reliable performance', '/images/f150.jpg', '/images/f150-thumb.jpg', 2),
  ('Porsche', '911', 'high-speed performance and sleek design', '/images/porsche.jpg', '/images/porsche-thumb.jpg', 3),
  ('Chevy', 'Malibu', 'smooth ride and great mileage', '/images/malibu.jpg', '/images/malibu-thumb.jpg', 4);

-- =============================================
-- Task 1 Queries copied into rebuild file
-- These MUST be the last statements in this file
-- =============================================

-- Query 4: Update the GM Hummer description using REPLACE
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Query 6: Add "/vehicles" into the image paths for all inventory records
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
