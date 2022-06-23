INSERT INTO customers (user_id, first_name, last_name, created_at, email, phone) 
VALUES (
                null,
                'jim',
                'bo',
                '2022-05-04 15:00:00',
                'jimbo@gmail.com',
                1112223333
        ),
        (
                1,
                'admin',
                'test',
                '2022-05-04 15:00:00',
                'admin@gmail.com',
                3332221111
        );

INSERT INTO users (username, password, first_name, last_name, email, phone, is_admin)
VALUES (
                'test',
                '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
                'jim',
                'bo',
                'jimbo@gmail.com',
                1112223333,
                FALSE
        ),
        (
                'testadmin',
                '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
                'admin',
                'test',
                'admin@gmail.com',
                3332221111,
                TRUE
        );

INSERT INTO products (name, published, description, variant_sku, price, image_source) 
VALUES (
                '#9FT Large Icing Piping Nozzles Russian Nozzles Pastry Tips Cookies Cake Decorating Tools Tips Cream Fondant Pastry Nozzles',
                TRUE,
                null,
                '30703423-9ft',
                1.7,
                'https://cdn.shopify.com/s/files/1/0252/8251/0902/products/product-image-1277715434.jpg?v=1584384449'
        ),
        (
                '1pc 8CM White Wooden Letters English Alphabet DIY Personalised Name Design Art Craft Wedding Home Decor letters room decoration',
                FALSE,
                null,
                '29103397-zm-g-8cm',
                1.74,
                'https://cdn.shopify.com/s/files/1/0252/8251/0902/products/product-image-1281285192.jpg?v=1584384461'
        ),
        (
               '20 Colors Mica Powder Epoxy Resin Dye Pearl Pigment Natural Mica Mineral Powder C63B',
               TRUE,
               null,
               '31980014',
               18.48,
               'https://cdn.shopify.com/s/files/1/0252/8251/0902/products/product-image-1303172540.jpg?v=1584384449'
        );