var db = window.openDatabase("owlsip_shop", "1.0", "Owl Sip", 200000);

function log(type, message) {
    var current_time = new Date();
    console.log(`${current_time} [${type}] ${message}`);
}

function fetch_transaction_success(table) {
    log(`INFO`, `Fetch into table "${table}" successfully.`);
}

function table_transaction_success(table) {
    log(`INFO`, `Create table "${table}" successfully.`);
}

function transaction_error(tx, error) {
    log(`ERROR`, `SQL Error ${error.code}: ${error.message}.`);
}

function initialize_database() {
    db.transaction(function (tx) {
        // Create table City
        var query = `CREATE TABLE IF NOT EXISTS city (
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL
                    )`;

        tx.executeSql(
            query,
            [],
            table_transaction_success(`City`),
            transaction_error
        );

        //Create table Account
        query = `CREATE TABLE IF NOT EXISTS account (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT NULL,
                last_name TEXT NULL,
                birthday REAL NULL,
                phone TEXT NULL,
                street TEXT NULL,
                ward_id INTEGER NULL,
                district_id INTEGER NULL,
                city_id INTEGER NULL,
                status INTEGER NOT NULL,
                FOREIGN KEY (city_id) REFERENCES city(id)
                )`;

        tx.executeSql(
            query,
            [],
            table_transaction_success(`Account`),
            transaction_error
        );

        //Create table Category
        query = `CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT NULL,
            parent_id INTEGER NULL,
            FOREIGN KEY (parent_id) REFERENCES category(id) 
            )`;

        tx.executeSql(
            query,
            [],
            table_transaction_success(`Category`),
            transaction_error
        );

        //Create table Product
        query = `CREATE TABLE IF NOT EXISTS product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT NULL,
                img_source TEXT NOT NULL,
                price INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES category(id)
                )`;

        tx.executeSql(
            query,
            [],
            table_transaction_success(`Product`),
            transaction_error
        );

        //Create table Cart
        query = `CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL, 
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (account_id) REFERENCES account(id),
                FOREIGN KEY (product_id) REFERENCES product(id) 
                )`;

        tx.executeSql(
            query,
            [],
            table_transaction_success(`Cart`),
            transaction_error
        );
    });
}

function fetch_database() {
    db.transaction(function (tx) {
        // Add admin account
        var query = `INSERT INTO account(username, password, status) VALUES (?,?,1)`;
        tx.executeSql(
            query,
            ["admin@gmail.com", "12345678"],
            fetch_transaction_success(`Account`),
            transaction_error
        );

        // Add example category
        query = `INSERT INTO category(name, description, parent_id) VALUES (?,?,?)`;
        tx.executeSql(
            query,
            ["Cafe", "Cafe description", 1],
            fetch_transaction_success(`Category`),
            transaction_error
        );
        tx.executeSql(
            query,
            ["Juice", "Juice description", 2],
            fetch_transaction_success(`Category`),
            transaction_error
        );

        // Add example product
        query = `INSERT INTO product(name, description, img_source, price, category_id) VALUES (?,?,?,?,?)`;
        tx.executeSql(
            query,
            ["Conut Cafe", "Conut Cafe description", "../img/products/conutcafe02.jpg", 49000, 1],
            fetch_transaction_success(`Product`),
            transaction_error
        );
        tx.executeSql(
            query,
            ["White Flat Cafe", "White Flat Cafe description", "../img/products/whitecafe02.jpg", 27000, 1],
            fetch_transaction_success(`Product`),
            transaction_error
        );
        tx.executeSql(
            query,
            ["Watermelon", "Watermelon description", "../img/products/watermelon01.jpg", 45000, 2],
            fetch_transaction_success(`Product`),
            transaction_error
        );
        tx.executeSql(
            query,
            ["Carrot", "Carrot description", "../img/products/carot01.jpg", 45000, 2],
            fetch_transaction_success(`Product`),
            transaction_error
        );
    });
}


