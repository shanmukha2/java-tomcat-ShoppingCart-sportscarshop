$(function () {

    var skip = 0;
    var rowsPerPage = 3;

    printProducts(skip, rowsPerPage);

    $('.mar-invisible').hide();
    $('#mar-signOut').hide();
    $('#mar-cartView').hide();

    // [<<]
    $('#prev').click(function () {
        skip -= rowsPerPage;
        if (skip < 0) skip = 0;
        printProducts(skip, rowsPerPage);
    });
    // [>>]
    $('#next').click(function () {
        skip += rowsPerPage;
        printProducts(skip, rowsPerPage);
    });

    // [Show Cart]
    $('#mar-showCart').click(function () {
        $('#mar-productView').hide();
        $('#mar-cartListTbody').html('');
        $('#mar-cartView').show();
        printCart()
    });

    // [Show Products]
    $('#mar-showProduct').click(function () {
        $('#mar-cartView').hide();
        $('#mar-productView').show();
    });

    // [Buy]
    $('#mar-buyButton').click(function () {
        keepUserCartInDatabase()
    });

    // [Sign In]
    $('#mar-signIn').click(function () {
        $('#mar-loginModal').modal('show');

    });
    // [Sign In - Login button]
    $('#mar-loginButton').click(function () {
        login($('#username').val(), $('#password').val());
    });

    // [Sign Out]
    $('#mar-signOut').click(function () {
        logout();
    });
});

// PRODUCTS ------------------------------------------------------------------------------------------------------------
function printProducts(skip, rowsPerPage) {

    $.ajax({
        url: 'api/product/list',
        method: 'GET',
        dataType: 'json',
        data: {
            size: rowsPerPage + 1,
            skip: skip
        }
    }).done(function (data) {

        if (data.length <= rowsPerPage) $('#next').hide();
        else $('#next').show();

        bildHtmlProductsRows(data, rowsPerPage);

    }).fail(function () {
        console.log("PRODUKTAI NEATSPAUSDINTI");
    });
}

function bildHtmlProductsRows(products, rowsPerPage) {

    var html = '';
    for (var i = 0; i < Math.min(products.length, rowsPerPage); i++) {

        html += '<tr class="ml-product">';
        html += ' <td class="text-right"><img src="' + products[i].image + '" alt="Responsive image" class="img-fluid" /></td>';
        html += ' <td>' + products[i].name + '</td>';
        html += ' <td class="text-right">' + products[i].price.toLocaleString() + '</td>';
        html += ' <td class="text-right">';
        html += '  <a href="#" class="nav-link btn btn-info btn-sm ml-add-krepselisX" ' +
            'onclick="jamam(' + products[i].id + ')">';
        html += '   <span class="glyphicon glyphicon-shopping-cart"></span> Add to Cart</a>';
        html += ' </td>';
        html += '</tr>';
    }
    $('#mar-productListTbody').html(html);
}

// CART ----------------------------------------------------------------------------------------------------------------
function jamam(productId) {

    // dedama į 1 krepseli
    $.ajax({
        url: 'api/cart/add',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            id: productId,
            qty: 1
        })
    }).done(function () {

        printCart();

    }).fail(function () {
        console.log('PREKE NE ĮDĖTA Į KREPŠELĮ');
    });
}

function printCart() {

    $.ajax({
        url: 'api/cart/getsessioncart',
        method: 'GET',
        dataType: 'json'
    }).done(function (cart) {

        bildHtmlCartRows(cart);

    }).fail(function () {
        console.log("CART NEATSPAUSDINTA");
    });
}

function bildHtmlCartRows(cart) {

    var cartLines = cart.cartLines;

    var html = '';
    for (var i = 0; i < cartLines.length; i++) {

        html += addHtmlCartRow(cartLines[i].id, cartLines[i].qty, cartLines[i].product);
    }

    $('#mar-cartListTbody').html(html);
    $('#mar-totalSum').html(cart.totalSum.toLocaleString());
    $('#mar-totalSumRespons').html(cart.totalSum.toLocaleString());
    $('.mar-invisible').hide();

    $('.mar-refreshCartLine').on('click', function () {

        var oldQty = Number($(this).closest('tr').find('input')[0].value);
        var productId = Number($(this).closest('tr').find('td')[0].innerHTML);
        updateCartLine(productId, oldQty);

    });
}

function addHtmlCartRow(cartLineId, cartLineQty, product) {

    var html = '<tr>';
    html += ' <td class="mar-invisible mar-cartLineProductId">' + product.id + '</td>';
    html += ' <td data-th="Product">';
    html += '   <div class="row">';
    html += '     <div class="col-sm-2 hidden-xs"><img src="' + product.image + '"  alt="..." class="img-fluid"/></div>';
    html += '     <div class="col-sm-10">';
    html += '       <h4 class="nomargin">' + product.name + '</h4>';
    html += '       <p>Good car!' + '</p>'; // dscription place
    html += '     </div>';
    html += '   </div>';
    html += ' </td>';
    html += ' <td data-th="Price" class="text-right">€ ' + product.price.toLocaleString() + '</td>';
    html += ' <td data-th="Quantity" class="text-right"><input type="number" class="form-control" value="' + cartLineQty + '"></td>';
    html += ' <td data-th="Subtotal" class="text-right">€ ' + (product.price * cartLineQty).toLocaleString() + '</td>';
    html += ' <td class="actions text-right" data-th="">';
    html += '   <button class="btn btn-info btn-sm mar-refreshCartLine"><i class="fa fa-refresh"></i></button>';
    html += '   <button class="btn btn-danger btn-sm" ' + 'onclick="deleteCartLine(' + product.id + ')"><i class="fa fa-trash-o"></i></button>';
    html += ' </td>';
    html += '</tr>';
    return html;
}

// UPDATE --------------------------------------------------------------------------------------------------------------
function updateCartLine(productId, oldQty) {

    if (oldQty < 0) oldQty = 0;

    $.ajax({
        url: 'api/cart/updateCartLine/' + productId + '/' + oldQty,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: {}
    }).done(function () {
        console.log("CartLine atnaujinta")
    }).fail(function () {
        console.log("CART LINE NE ATNAUJINTA");
    });
    printCart()
}

// DELETE --------------------------------------------------------------------------------------------------------------
function deleteCartLine(productId) {

    $.ajax({
        url: 'api/cart/deleteCartLine/' + productId,
        method: 'DELETE',
        dataType: 'json',
        contentType: 'application/json'
    }).done(function () {
        console.log("CartLine istrinta")
    }).fail(function () {
        console.log("CART LINE NE ISTRINTA");
    });
    printCart()
}

// LOGIN ---------------------------------------------------------------------------------------------------------------
function login(username, password) {

    $.ajax({
        url: 'api/auth/login',
        method: 'POST',
        dataType: 'json',
        Accept: 'application/json',
        contentType: 'application/json',
        data: JSON.stringify({
            username: username,
            password: password
        })
    }).done(function (data) {
        console.log('PRISILOGINTA');

        sinchronizuotiKrepselius(username);

        window.localStorage.token = data.token;

        $('#mar-signIn').hide();
        $('#mar-signOut').show();
        $('#mar-loginModal').modal('hide');
        $('#mar-loggedUserName').text('User: ' + username);

    }).fail(function () {
        $('#mar-loginModal').modal('hide');
        console.log('NE PRISILOGINTA');
        alert('Neprisijungta, neteisingi duomenys!');
    });
}

function sinchronizuotiKrepselius(username) {

    var token = window.localStorage.token;

    $.ajax({
        url: 'api/mar/cart-cart',
        method: 'PUT',
        Accept: 'application/json',
        dataType: 'json',
        headers: {Authorization: "Bearer " + token}
    }).done(function (userCart) {

        alert("Guest krepšelis sinchonizuotas su vartotojo\n" + username + '\nkrepšeliu');
        console.log("User cart=" + userCart);

    }).fail(function () {
        console.log("KREPŠELIS NESINCHRONIZUOTAS");
    });
}

function logout() {

    keepUserCartInDatabase();

    $.ajax({
        url: 'api/auth/logout',
        method: 'POST',
        Accept: 'application/json',
        contentType: 'application/json'
    }).done(function () {
        console.log('IŠSILOGINTA');

        $('#mar-signOut').hide();
        $('#mar-signIn').show();
        $('#mar-loggedUserName').text("User: Guest");

    }).fail(function () {
        console.log('NE IŠSILOGINTA')
    });
}

function keepUserCartInDatabase() {

    var token = window.localStorage.token;

    $.ajax({
        url: 'api/mar/keepusercart',
        method: 'PUT',
        Accept: 'application/json',
        dataType: 'json',
        headers: {Authorization: "Bearer " + token}
    }).done(function (userCart) {
        console.log("VARTOTOJO KREPŠELIS ISSAUGOTAS DB");
        console.log("User cart=" + userCart);

    }).fail(function () {
        alert("VARTOTOJO KREPŠELIS NE ISSAUGOTAS DB");
    });
}

