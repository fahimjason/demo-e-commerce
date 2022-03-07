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

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });

    product.save()
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

    Product.findById(productId)
        .then(product => {
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
    const { title, imageUrl, price, description, productId } = req.body;

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) return res.redirect('/');

            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;

            return product.save().then(result => {
                console.log('Product updated successfully.');
                res.redirect('/admin/products');
            })
        })
        .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
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

    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
            console.log('Product destroyed.');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}