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

    var account_info_index = document.getElementById("account-info-index");

    update_cart_quantity();
    account_info_index.innerHTML = "";
    account_info_index.innerHTML = `
                <div id="account-info" class="float-end float-lg-start">
                    <div class="dropdown">
                        <div class="" id="dropdownMenuButton" data-bs-toggle="dropdown"
                            aria-expanded="false" style="border: none;">
                            <img src="img/icon/account_circle_black_24dp.svg" width="42px">
                        </div>
                        <ul class="dropdown-menu dropdown-menu-end mt-3" aria-labelledby="dropdownMenuButton">
                            <li class=""><a href="html/profile.html" class="dropdown-item">Profile</a></li>
                            <li id="admin-index"></li>
                            <li><a href="" style="text-decoration: none;"><btn onclick="logout()" class="dropdown-item btn">Logout<img src="img/icon/logout-icon.svg" class="float-end"></btn></a></li>
                        </ul>
                    </div>
                </div>`

    document.getElementById("cart-info-index").innerHTML = `
        <a href="html/cart.html"><img src="img/icon/cart.svg" width="42px"
        title="Cart" alt="Cart"><span id="cart-quantity" class="me-3"></span></a>
        `;

    var account_username = localStorage.getItem("username");

    if (account_username == "admin@gmail.com") {
        document.getElementById("admin-index").innerHTML += `<a href="admin/product/index.html" class="dropdown-item">Update product</a>`;
    }
}

function logout() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("username", "");

    document.getElementById("account-info-index").innerHTML = `
                                                <a href="" data-bs-toggle="modal" data-bs-target="#login-frm"><img
                                                src="img/icon/account_circle_black_24dp.svg" width="42px" title="Login" alt="Login"></a>
                                                 `;
    document.getElementById("loginMessage").innerHTML = "";
    document.getElementById("cart-quantity").innerHTML = ``;
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
