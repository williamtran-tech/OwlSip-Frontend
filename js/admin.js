function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// FUNCTION FOR ADMIN - SHOW ALL PRODUCTS

function get_all_product() {
    db.transaction(function (tx) {

        var query = `
        SELECT p.id, p.name, p.price, p.description, c.name as category_name
        FROM product p, category c
        WHERE p.category_id = c.id
        `;

        tx.executeSql(
            query,
            [],
            function (tx, result) {
                log(`INFO`, `Get all products successfully.`);
                document.getElementById("all-products").innerHTML += `
                    <table class="table table-warning table-striped text-center">
                        <thead class="text-dark fs-5">
                            <tr>
                                <th scope="col" class="text-start">Product</th>
                                <th scope="col">Price</th>
                                <th scope="col" class="text-start">Product description</th>
                                <th scope="col">Category</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody id="product-list" class=""></tbody>
                    </table>
                    `;
                show_all_product(result.rows);

            },
            transaction_error
        );
    });
}

function show_all_product(products) {
    var product_table = document.getElementById("product-list");

    for (var product of products) {
        var product_price = numberWithCommas(product.price);
        product_table.innerHTML += `
            <tr id="product-list-item-${product.id}">
                <td class="text-start" id="product-list-name-${product.id}">${product.name}</td>
                <td>${product_price}</td>
                <td class="text-start">${product.description}</td>
                <td>${product.category_name}</td>
                <td>
                    <button onclick="delete_product_item(this.id)" id="${product.id}" class="btn btn-sm"><img src=../../img/icon/delete-item.png width="25px" class="delete-icon"></button>
                </td>
            </tr>
            `;
    }
}

function delete_product_item(product_id) {
    db.transaction(function (tx) {
        var query = `DELETE FROM product WHERE id = ?`;

        tx.executeSql(
            query,
            [product_id],
            function (tx, result) {
                var product_name = document.getElementById(
                    `product-list-name-${product_id}`
                );
                var message = `Delete "${product_name.innerText}" successfully.`;

                document.getElementById(`product-list-item-${product_id}`).outerHTML = "";

                log(`INFO`, message);
            },
            transaction_error
        );
    });
}

document.getElementById("create-product-frm").onsubmit = create;

function create(e) {
    e.preventDefault();

    var product_name = document.getElementById("name").value;
    var product_description = document.getElementById("description").value;
    var product_price = document.getElementById("price").value;
    var product_category = document.getElementById("category-select").value;
    var product_img_src = document.getElementById("img-src").value;

    db.transaction(function (tx) {
        var query = `INSERT INTO product(name, description, img_source, price, category_id) VALUES (?,?,?,?,?)`;

        tx.executeSql(
            query,
            [product_name, product_description, product_img_src, product_price, product_category],
            function (tx, result) {
                log("INFO", `Create product "${product_name}" successfully.`);

                document.getElementById("create-product-frm").reset();
                document.getElementById("name").focus();
            },
            transaction_error
        );
    });
}