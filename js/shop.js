function on_load() {
    update_cart_quantity();

    var account_id = localStorage.getItem("account_id");

    if (account_id) {
        login_success();
    }
    else {
        logout();
    }

}

document.getElementById("login-frm").onsubmit = login;

function login(e) {
    e.preventDefault();

    var login_message = document.getElementById("loginMessage");

    document.getElementById("username-register").value = "";
    document.getElementById("password-register").value = "";
    document.getElementById("re-password").value = "";

    document.getElementById("registerMessage").innerHTML = "";

    //Get value from <input>
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    db.transaction(function (tx) {
        var query = `SELECT * FROM account WHERE username = ? AND password = ?`;

        tx.executeSql(
            query,
            [username, password],
            function (tx, result) {
                if (result.rows[0]) {
                    $("#login-frm").modal("hide");

                    localStorage.setItem("account_id", result.rows[0].id);
                    localStorage.setItem("username", result.rows[0].username);

                    login_success();
                }
                else {
                    if (login_message.innerHTML != ``) {/**do nothing */ }
                    else {
                        login_message.innerHTML += `Wrong username or password.`
                    }

                }
            },
            transaction_error
        );
    });
}

function login_success() {

    var account_info = document.getElementById("account-info");

    update_cart_quantity();
    account_info.innerHTML = "";
    account_info.innerHTML = `
                            <div id="account-info" class="float-end float-lg-start">
                                <div class="dropdown">
                                    <div class="" id="dropdownMenuButton" data-bs-toggle="dropdown"
                                        aria-expanded="false" style="border: none;">
                                        <img src="../img/icon/account_circle_black_24dp.svg" width="42px">
                                    </div>
                                    <ul class="dropdown-menu dropdown-menu-end mt-3" aria-labelledby="dropdownMenuButton">
                                        <li class=""><a href="../html/profile.html" class="dropdown-item">Profile</a></li>
                                        <li id="admin"></li>
                                        <li><a href="/" style="text-decoration: none;"><btn onclick="logout()" class="dropdown-item btn">Logout<img src="../img/icon/logout-icon.svg" class="float-end"></btn></a></li>
                                    </ul>
                                </div>
                            </div>`;

    document.getElementById("cart-info").innerHTML = `
                    <a href="../html/cart.html"><img src="../img/icon/cart.svg" width="42px"
                    title="Cart" alt="Cart"><span id="cart-quantity" class="me-3"></span></a>
                    `;

    var account_username = localStorage.getItem("username");

    if (account_username == "admin@gmail.com") {
        document.getElementById("admin").innerHTML += `<a href="../admin/product/index.html" class="dropdown-item">Update product</a>`;
    }
}

function logout() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("username", "");

    document.getElementById("account-info").innerHTML = `
                                                        <a href="" data-bs-toggle="modal" data-bs-target="#login-frm"><img
                                                        src="../img/icon/account_circle_black_24dp.svg" width="42px" title="Login" alt="Login"></a>
                                                         `;
    document.getElementById("loginMessage").innerHTML = "";
    document.getElementById("cart-quantity").innerHTML = ``;
}

document.getElementById("register-frm").onsubmit = register;

function register(e) {
    e.preventDefault();

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginMessage").innerHTML = "";

    var username = document.getElementById("username-register").value;
    var password = document.getElementById("password-register").value;
    var re_password = document.getElementById("re-password").value;

    if (password == re_password) {
        db.transaction(function (tx) {

            var query = `INSERT INTO account (username, password, status) VALUES (?,?,1)
                        `;

            tx.executeSql(query,
                [username, password],
                function (tx, result) {
                    document.getElementById("loginMessage").innerHTML = "";
                    document.getElementById("username").value = "";
                    document.getElementById("password").value = "";
                    $("#register-frm").modal("hide");
                    $("#login-frm").modal("show");
                    document.getElementById("register-frm").reset();
                    document.getElementById("registerMessage").innerText = "";
                },
                function (tx, result) {
                    document.getElementById("registerMessage").innerHTML = "This email have been used.";
                }
            );
        });
    }
    else {
        document.getElementById("registerMessage").innerHTML = "Wrong confirmed password.";
    };
}

//FUNCTION FOR SHOP PAGE
function get_product() {
    db.transaction(function (tx) {

        var query = `
        SELECT p.id, p.name, p.img_source ,p.price, c.name as category_name
        FROM product p, category c
        WHERE p.category_id = c.id
        `;

        tx.executeSql(
            query,
            [],
            function (tx, result) {
                log(`INFO`, `Get a list of products successfully.`);
                show_product(result.rows);
            },
            transaction_error
        );
    });
}

function show_product(products) {

    for (var product of products) {
        var price = numberWithCommas(product.price);

        if (product.category_name == "Cafe") {
            var product_list_cafe = document.getElementById("cafe-category");
            product_list_cafe.innerHTML += ` <div class="col-6 col-sm-4 col-lg-3 p-3 product">
                                            <div class="product-img">
                                                <img src="${product.img_source}" width="100%" alt="${product.name}">
                                            </div>
                                            <div class="product-name">${product.name}</div>
                                            <div class="product-category">${product.category_name}</div>
                                            <div class="product-price">${price} VND</div>
                                            <div class="add-to-cart float-end">
                                                <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn">Add to Cart</button>
                                            </div>
                                        </div>
        `;
        }

        if (product.category_name == "Juice") {
            var product_list_juice = document.getElementById("juice-category");
            product_list_juice.innerHTML += `   <div class="col-6 col-sm-4 col-lg-3 p-3 product">
                                                    <div class="product-img">
                                                        <img src="${product.img_source}" width="100%" alt="${product.name}">
                                                    </div>
                                                    <div class="product-name">${product.name}</div>
                                                    <div class="product-category">${product.category_name}</div>
                                                    <div class="product-price">${price} VND</div>
                                                    <div class="add-to-cart float-end">
                                                        <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn">Add to Cart</button>
                                                    </div>
                                                </div>
        `;
        }


    };
}

// FUNCTION FOR CART

function add_to_cart(product_id) {

    var account_id = localStorage.getItem("account_id");

    if (account_id != "") {
        db.transaction(function (tx) {
            var query = `SELECT quantity FROM cart WHERE account_id = ? AND product_id = ?`;

            tx.executeSql(query,
                [account_id, product_id],
                function (tx, result) {
                    if (result.rows[0]) {
                        update_cart_database(product_id, result.rows[0].quantity + 1);
                        update_cart_quantity();
                    }
                    else {
                        add_cart_database(product_id);
                        update_cart_quantity();
                    }
                },
                transaction_error);
        });
    }
    else {
        $("#login-frm").modal("show");
    }
}

function update_cart_quantity() {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `SELECT SUM(quantity) AS total_quantity FROM cart WHERE account_id = ?`;

        tx.executeSql(query,
            [account_id],
            function (tx, result) {
                if (result.rows[0].total_quantity) {
                    document.getElementById("cart-quantity").innerText =
                        result.rows[0].total_quantity;
                }
                else {
                    document.getElementById("cart-quantity").innerText = "";
                }
            },
            transaction_error);
    });
}

function add_cart_database(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `INSERT INTO cart (account_id, product_id, quantity) VALUES (?,?,?)`;

        tx.executeSql(query,
            [account_id, product_id, 1],
            function (tx, result) {
                log("INFO", "Insert cart successfully.");
            },
            transaction_error
        );
    });
}

function update_cart_database(product_id, quantity) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `UPDATE cart SET quantity = ? WHERE account_id = ? AND product_id = ?`;

        tx.executeSql(query,
            [quantity, account_id, product_id],
            function (tx, result) {
                log("INFO", "Update cart successfully.");
            },
            transaction_error
        );
    });
}

function get_cart_list() {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `
        SELECT p.id, p.name, p.price, c.quantity
        FROM product p, cart c
        WHERE p.id = c.product_id AND c.account_id = ?
        `;

        tx.executeSql(query,
            [account_id],
            function (tx, result) {
                log("INFO", "Get a list of products in cart successfully.");
                if (result.rows[0]) {
                    document.getElementById("order-table").innerHTML = `
                    <table class="table table-warning table-striped text-center">
                        <thead class="text-dark fs-5">
                            <tr>
                                <th scope="col">Product</th>
                                <th scope="col">Price</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody id="cart-list" class=""></tbody>
                    </table>
                  `;
                    show_cart_list(result.rows);
                }
                else {
                    document.getElementById("order-table").innerHTML = ``;
                    document.getElementById("empty-cart").innerHTML = `
                        <img src="../img/icon/empty-cart.jpg" width="40%" id="empty-cart-img" class="opacity-75">
                        <div class="description fs-2 text-secondary opacity-75">Your cart is empty</div>
                        <div class="btnShop"><a href="../html/shop.html" style="text-decoration: none; color: white;">SHOP NOW</a></div>
                    `;
                }
            },
            transaction_error
        );
    });


}

function show_cart_list(products) {
    var total = 0;
    var cart_list = document.getElementById("cart-list");

    for (var product of products) {
        var amount = product.price * product.quantity;
        total += amount;

        var price = numberWithCommas(amount);
        var product_price = numberWithCommas(product.price);
        cart_list.innerHTML += `
            <tr id="cart-list-item-${product.id}">
                <td class="text-start" id="cart-list-name-${product.id}">${product.name}</td>
                <td>${product_price}</td>
                <td>${product.quantity}</td>
                <td>${price}</td>
                <td>
                    <button onclick="delete_cart_item(this.id)" id="${product.id}" class="btn btn-sm"><img src=../img/icon/delete-item.png width="25px" class="delete-icon"></button>
                </td>
            </tr>
            `;
    };

    total_price = numberWithCommas(total);
    cart_list.innerHTML += `
        <tr>
            <th></th>
            <th></th>
            <th class="total-amount text-success">Total</th>
            <th id="total" class="total-amount text-success">${total_price}</th>
            <th></th>
        </tr>
    `
}

function delete_cart_item(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `DELETE FROM cart WHERE account_id = ? AND product_id = ?`;

        tx.executeSql(
            query,
            [account_id, product_id],
            function (tx, result) {
                var product_name = document.getElementById(
                    `cart-list-name-${product_id}`
                );
                var message = `Delete "${product_name.innerText}" successfully.`;

                document.getElementById(`cart-list-item-${product_id}`).outerHTML = "";

                log(`INFO`, message);

                update_cart_quantity();

                updated_cart();

            },
            transaction_error
        );
    });
}

function updated_cart() {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `
        SELECT p.id, p.name, p.price, c.quantity
        FROM product p, cart c
        WHERE p.id = c.product_id AND c.account_id = ?
        `;

        tx.executeSql(query,
            [account_id],
            function (tx, result) {
                log("INFO", "Get updated cart successfully.");
                update_total_amount(result.rows);

                if (result.rows[0]) {
                    //Do nothing
                }
                else {
                    document.getElementById("order-table").innerHTML = '';
                    document.getElementById("empty-cart").innerHTML = `
                        <img src="../img/icon/empty-cart.jpg" width="40%" id="empty-cart-img" class="opacity-75">
                        <div class="description fs-2 text-secondary opacity-50">Your cart is empty</div>
                        <div class="btnShop"><a href="../html/shop.html" style="text-decoration: none; color: white;">SHOP NOW</a></div>
                    `;
                }
            },
            transaction_error
        );
    });
}

function update_total_amount(products) {
    var total = 0;

    for (var product of products) {
        var amount = product.price * product.quantity;
        total += amount;
    }

    document.getElementById("total").innerText = numberWithCommas(total);

}

function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}