const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
class Product {
    constructor(title, imageUrl, price, description, id) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = +price;
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        let dbOp;

        if (this._id) {
            dbOp = db.collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        }
        else {
            dbOp = db.collection('products').insertOne(this);
        }

        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();

        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => console.error(err));
    }

    static findById(prodId) {
        const db = getDb();

        return db.collection('products')
            .find({ _id: new mongodb.ObjectId(prodId) })
            .next()
            .then(product => {
                console.log(product);
                return product;
            })
            .catch(err => console.error(err));
    }

    static deleteById(prodId) {
        const db = getDb();

        return db.collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(product => {
                console.log('Deleted');
            })
            .catch(err => console.error(err));
    }
}

module.exports = Product;