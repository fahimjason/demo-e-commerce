const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51Ie3IHAgyIUkUwiGJHxAtAXeIEIt8EueaFZ2Z8Hpn3wf7jqtir5DZjh5LG0p3yNLGcXbQP4Me4VxgXNrlewUAuVL00JQjnz4lG');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;

            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => res.redirect('/cart'))
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    req.user.removeFromCart(prodId)
        .then(result => res.redirect('/cart'))
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;

    req.user.populate('cart.items.productId')
        .then(user => {
            products = user.cart.items;
            total = 0;

            products.forEach(p => {
                total += p.quantity * p.productId.price;
            });

            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.quantity * 100,
                        currency: "usd",
                        quantity: p.quantity
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',      // => http://localhost:3000
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/success'
            });
        })
        .then(session => {
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products: products,
                totalSum: total,
                sessionId: session.id
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckoutSuccess = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: { ...item.productId._doc } };
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });

            return order.save();
        })
        .then(() => req.user.clearCart())
        .then(result => res.redirect('/orders'))
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = '500';
            return next(error);
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then(order => {
            if (!order) return next(new Error('No order found.'));

            if (order.user.userId.toString() !== req.user._id.toString()) return next(new Error('Unauthorized'));

            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('-----------------------');

            let totalPrice = 0;

            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
            });

            pdfDoc.text('---');
            pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

            pdfDoc.end();
        })
        .catch(err => next(err));
};