const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
}

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;

    // Product.create()
    req.user.createProduct({
        title,
        imageUrl,
        price,
        description,
        userId: req.user.id
    })
        .then(result => {
            console.log('Product Added Successfully.');
            res.redirect('/admin/products');
        })
        .catch((err) => console.error(err));
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const productId = req.params.productId;

    if (!editMode) return res.redirect('/');

    req.user.getProducts({ where: { id: productId } })
        // Product.findByPk(productId)
        .then(products => {
            const product = products[0];

            if (!product) return res.redirect('/');

            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;

    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.imageUrl = imageUrl;
            product.price = price;
            product.description = description;
            return product.save();
        })
        .then(result => {
            console.log('Product updated successfully.');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    // Product.findAll()
    req.user.getProducts()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch((err) => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findByPk(prodId)
        .then(product => product.destroy())
        .then(result => {
            console.log('Product destroyed.');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}