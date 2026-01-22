-- 1. Insertar nuevo registro (Tony Stark)
INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Cambiar el tipo de cuenta de Tony Stark a "Admin"
UPDATE account
SET account_type = 'Admin'
WHERE email = 'tony@starkent.com';

-- 3. Eliminar el registro de Tony Stark
DELETE FROM account
WHERE email = 'tony@starkent.com';

-- 4. Reemplazar "small interiors" por "a huge interior" en GM Hummer
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. INNER JOIN para mostrar make, model y classification_name del tipo "Sport"
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Actualizar rutas de imágenes para incluir "/vehicles"
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
