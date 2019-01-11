

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

                console.log(configProd);
            });

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

                console.log(configProd);
            });

        }
    })
}

configCP(dataLayer[0]['productId'])