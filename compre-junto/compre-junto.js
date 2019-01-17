const urlApi = () => "/api/catalog_system/pub/products/search?fq=productId:";

//Retorna o id do produto 2 do compre junto!
const getProductCP = async () => {
    return fetch(urlApi() + dataLayer[0].productId)
        .then(res => res.json())
        .then(res => {
            if (!res[0]["Compre Junto"] || res[0]["Compre Junto"].length <= 0) return null;
            else return res[0]["Compre Junto"][0];
        })
        .catch(error => error)
}

//Verifica se o produto é um produto que possui compre junto
const isProdCP = async () => {
    let pId = await getProductCP();
    if (!pId) {
        console.log('Compre Junto: Produto não possui produto para compre junto!');
        if (document.querySelector('.compre-junto')) document.querySelector('.compre-junto').remove();
        return false;
    }
    return pId;
}

//Cria um objeto com os dados dos dois produtos
const createProductsObj = async () => {
    let cp = await isProdCP();
    if (!cp) return false;
    return {
        p1: await fetch(urlApi() + dataLayer[0].productId).then(res => res.json()).then(res => res[0]),
        p2: await fetch(urlApi() + cp).then(res => res.json()).then(res => res[0])
    }
}

//Abstrai apenas os dados relevantes para aplicação, criando assim um objeto.
const mountProducts = async () => {
    let products = await createProductsObj();
    if (!products) return false;
    let quantity = [0, 0];
    let pr = {};

    products.p1.items.forEach(function (element) {
        quantity[0] += element.sellers[0].commertialOffer.AvailableQuantity;
    });
    products.p2.items.forEach(function (element) {
        quantity[1] += element.sellers[0].commertialOffer.AvailableQuantity;
    });

    if (quantity[0] <= 0 || quantity[1] <= 0) {
        if (document.querySelector('.compre-junto')) document.querySelector('.compre-junto').remove();
        return false;
    }

    pr = {
        product1: {
            productName: products.p1.productName,
            productImg: products.p1.items[0].images[0].imageUrl,
            productPrices: {
                priceDe: products.p1.items[0].sellers[0].commertialOffer.ListPrice,
                pricePor: products.p1.items[0].sellers[0].commertialOffer.Price
            },
            productTams: {}
        },
        product2: {
            productName: products.p2.productName,
            productImg: products.p2.items[0].images[0].imageUrl,
            productPrices: {
                priceDe: products.p2.items[0].sellers[0].commertialOffer.ListPrice,
                pricePor: products.p2.items[0].sellers[0].commertialOffer.Price
            },
            productUrl: products.p2.link,
            productTams: {}
        }
    }

    products.p1.items.forEach(function (val) {
        if (val.sellers[0].commertialOffer.AvailableQuantity > 0) pr.product1.productTams[val.TAMANHO[0]] = val.itemId;
    })

    products.p2.items.forEach(function (val) {
        if (val.sellers[0].commertialOffer.AvailableQuantity > 0) pr.product2.productTams[val.TAMANHO[0]] = val.itemId;
    })

    return pr;
}

const executeCP = async () => {
    let products = await mountProducts();
    if (!products) return false;
    let finalPrice = 0;

    document.querySelector('.compre-junto').setAttribute('style', 'display: block;');
    for (var i = 0; i < 2; i++) {

        document.querySelector('.compre-junto').setAttribute('style', 'display: block;');
        document.querySelector('.compre-junto .produto_' + (i + 1) + ' img').setAttribute('src', Object.values(products)[i].productImg);
        document.querySelector('.compre-junto .produto_' + (i + 1) + ' .nome').innerHTML = Object.values(products)[i].productName;
        document.querySelector('.compre-junto .produto_' + (i + 1) + ' .prec .antigo').innerHTML = `R$ ${getPrice(Object.values(products)[i].productPrices.priceDe)}`;
        document.querySelector('.compre-junto .produto_' + (i + 1) + ' .prec .atual').innerHTML = `R$ ${getPrice(Object.values(products)[i].productPrices.pricePor)}`;

        var select = document.querySelectorAll('.tams select')[i];

        for (var i1 = 0; i1 < Object.keys(Object.values(products)[i].productTams).length; i1++) {
            select.appendChild(new Option(Object.keys(Object.values(products)[i].productTams)[i1], Object.values(Object.values(products)[i].productTams)[i1]))
        }

        finalPrice += Object.values(products)[i].productPrices.pricePor;
    }
    document.querySelector('.compre-junto .product-redirect').setAttribute('href', Object.values(products)[1].productUrl);
    document.querySelector('.compre-junto .product-redirect').setAttribute('title', Object.values(products)[1].productName);

    document.querySelector('.coprjt-total').innerHTML = `R$ ${getPrice(finalPrice)}`;
    document.querySelector('.compre-junto .btn-compra').addEventListener('click', function () {

        let skuIds = {
            prod1: document.querySelectorAll('.tams select')[0].value,
            prod2: document.querySelectorAll('.tams select')[1].value
        }

        if (skuIds.prod1 == 'Tamanho' || skuIds.prod2 == 'Tamanho') {
            document.querySelector('.compre-junto .error-stk').style.display = "block";
            return false;
        }
        document.querySelector('.compre-junto .error-stk').style.display = "none";
        return window.location.href = "/checkout/cart/add?sc=1&sku=" + skuIds.prod1 + "&qty=1&seller=1" + "&sku=" + skuIds.prod2 + "&qty=1&seller=1";
    });
}
executeCP();