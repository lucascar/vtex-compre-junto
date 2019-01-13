/**
 * Verifica se o compre junto está presente no produto
 */
function verifyCP(productId) {
    return new Promise(function (resolve, reject) {
        fetch("/api/catalog_system/pub/products/search?fq=productId:" + productId).then(function (response) {
            return response.json()
        }).then(function (res) {
            if (!res || res.length <= 0) {
                return resolve(null);
            } else {
                return resolve(res[0]["Compre Junto"]);
            }
        })
    })
}

function configCP(productId) {

    return new Promise(function (resolve, reject) {

        var cp = verifyCP(productId);

        //Está função vai verificar se o produto 1 tem a especificação "Compre Junto" se não tiver, ela apaga o Compre Junto da Página
        cp.then(function (res) {
            if (!res) {
                console.log('Compre Junto: Produto não possui produto para compre junto!');
                if (document.querySelector('.compre-junto')) {
                    document.querySelector('.compre-junto').remove();
                }
                resolve(null);
                return false;
            } else {

                var uri1 = "/api/catalog_system/pub/products/search?fq=productId:" + productId;
                var uri2 = "/api/catalog_system/pub/products/search?fq=productId:" + res;

                var produto1 = fetch(uri1);
                var produto2 = fetch(uri2);
                var produtosCP = [];

                //Produto 1 do compre junto
                produto1.then(function (response) {
                    return response.json();
                }).then(function (response) {

                    var produto = response[0]
                    var qtd = 0;

                    produto.items.forEach(function (element) {
                        qtd += element.sellers[0].commertialOffer.AvailableQuantity;
                    });
                    if (qtd <= 0) {
                        console.log('Compre Junto: Produto 1 sem estoque!');
                        if (document.querySelector('.compre-junto')) {
                            document.querySelector('.compre-junto').remove();
                        }
                        resolve(null);
                        return false;
                    }

                    var configProd = {
                        productName: produto.productName,
                        productImg: produto.items[0].images[0].imageUrl,
                        productPrices: {
                            priceDe: produto.items[0].sellers[0].commertialOffer.ListPrice,
                            pricePor: produto.items[0].sellers[0].commertialOffer.Price
                        },
                        productTams: {}
                    }

                    produto.items.forEach(function (val) {
                        configProd.productTams[val.TAMANHO[0]] = val.itemId;
                    })

                    produtosCP.push(configProd);

                    //Produto 2 do compre junto
                    produto2.then(function (response) {
                        return response.json();
                    }).then(function (response) {

                        var produto = response[0]
                        var qtd = 0;

                        produto.items.forEach(function (element) {
                            qtd += element.sellers[0].commertialOffer.AvailableQuantity;
                        });
                        if (qtd <= 0) {
                            console.log('Compre Junto: Produto 2 sem estoque!');
                            if (document.querySelector('.compre-junto')) {
                                document.querySelector('.compre-junto').remove();
                            }
                            resolve(null);
                            return false;
                        }

                        var configProd = {
                            productName: produto.productName,
                            productImg: produto.items[0].images[0].imageUrl,
                            productPrices: {
                                priceDe: produto.items[0].sellers[0].commertialOffer.ListPrice,
                                pricePor: produto.items[0].sellers[0].commertialOffer.Price
                            },
                            productTams: {}
                        }

                        produto.items.forEach(function (val) {
                            configProd.productTams[val.TAMANHO[0]] = val.itemId;
                        })

                        produtosCP.push(configProd);
                        produtosCP.push(true)

                        resolve(produtosCP);

                    });

                });
            }
        })
    })
}

function createCP() {
    configCP(dataLayer[0]['productId']).then(function (r) {
        if (!r) {
            return false;
        } else {

            var finalPrice = 0;

            for (var i = 0; i < 2; i++) {

                document.querySelector('.compre-junto').setAttribute('style', 'display: block;');
                document.querySelector('.compre-junto .produto_' + (i + 1) + ' img').setAttribute('src', r[i].productImg);
                document.querySelector('.compre-junto .produto_' + (i + 1) + ' .nome').innerHTML = r[i].productName;
                document.querySelector('.compre-junto .produto_' + (i + 1) + ' .prec .antigo').innerHTML = `R$ ${getPrice(r[i].productPrices.priceDe)}`;
                document.querySelector('.compre-junto .produto_' + (i + 1) + ' .prec .atual').innerHTML = `R$ ${getPrice(r[i].productPrices.pricePor)}`;

                var select = document.querySelectorAll('.tams select')[i];

                for (var i1 = 0; i1 < Object.keys(r[i].productTams).length; i1++) {
                    select.appendChild(new Option(Object.keys(r[i].productTams)[i1], Object.values(r[i].productTams)[i1]))
                }

                finalPrice += r[i].productPrices.pricePor;
            }

            document.querySelector('.coprjt-total').innerHTML = `R$ ${getPrice(finalPrice)}`;


            document.querySelector('.compre-junto .btn-compra').addEventListener('click', function () {

                var skuIds = {
                    prod1: document.querySelectorAll('.tams select')[0].value,
                    prod2: document.querySelectorAll('.tams select')[1].value
                }

                if (skuIds.prod1 == 'Tamanho' || skuIds.prod2 == 'Tamanho') {
                    alert('Por favor, selecione o tamanho!');
                } else {
                    window.location.href = "/checkout/cart/add?sc=1&sku=" + skuIds.prod1 + "&qty=1&seller=1" + "&sku=" + skuIds.prod2 + "&qty=1&seller=1";
                }
            });

        }
    })
}