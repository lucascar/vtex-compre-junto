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

    var cp = verifyCP(productId);

    //Está função vai verificar se o produto 1 tem a especificação "Compre Junto" se não tiver, ela apaga o Compre Junto da Página
    cp.then(function (res) {
        if (!res) {
            console.log('Compre Junto: Produto não possui produto para compre junto!');
            document.querySelector('.compre-junto').remove();
            return false;
        } else {

            var uri1 = "/api/catalog_system/pub/products/search?fq=productId:" + productId;
            var uri2 = "/api/catalog_system/pub/products/search?fq=productId:" + res;

            var produto1 = fetch(uri1);
            var produto2 = fetch(uri2);

            var valorTotal = 0;

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
                    document.querySelector('.compre-junto').remove();
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

                document.querySelector('.compre-junto').setAttribute('style', 'display: block;');
                document.querySelector('.compre-junto .produto_1 img').setAttribute('src', configProd.productImg);
                document.querySelector('.compre-junto .produto_1 .nome').innerHTML = configProd.productName;
                document.querySelector('.compre-junto .produto_1 .prec .antigo').innerHTML = `R$ ${getPrice(configProd.productPrices.priceDe)}`;
                document.querySelector('.compre-junto .produto_1 .prec .atual').innerHTML = `R$ ${getPrice(configProd.productPrices.pricePor)}`;

                var select = document.querySelectorAll('.tams select')[0];

                for (var i1 = 0; i1 < Object.keys(configProd.productTams).length; i1++) {
                    select.appendChild(new Option(Object.keys(configProd.productTams)[i1], Object.values(configProd.productTams)[i1]))
                }

                valorTotal += configProd.productPrices.pricePor;

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
                        document.querySelector('.compre-junto').remove();
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

                    document.querySelector('.compre-junto').setAttribute('style', 'display: block;');
                    document.querySelector('.compre-junto .produto_2 img').setAttribute('src', configProd.productImg);
                    document.querySelector('.compre-junto .produto_2 .nome').innerHTML = configProd.productName;
                    document.querySelector('.compre-junto .produto_2 .prec .antigo').innerHTML = `R$ ${getPrice(configProd.productPrices.priceDe)}`;
                    document.querySelector('.compre-junto .produto_2 .prec .atual').innerHTML = `R$ ${getPrice(configProd.productPrices.pricePor)}`;

                    var select = document.querySelectorAll('.tams select')[1];

                    for (var i1 = 0; i1 < Object.keys(configProd.productTams).length; i1++) {
                        select.appendChild(new Option(Object.keys(configProd.productTams)[i1], Object.values(configProd.productTams)[i1]))
                    }

                    valorTotal += configProd.productPrices.pricePor;

                    //Insere o valor total dos 2 produtos
                    document.querySelector('.coprjt-total').innerHTML = `R$ ${getPrice(valorTotal)}`;

                });

            });
        }
    })
}

configCP(dataLayer[0]['productId'])