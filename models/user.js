const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;
class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();

        return db.collection('users')
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
        const updatedCartItems = [...this.cart.items];
        let newQuantity = 1;

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity });
        }

        const updatedCart = { items: updatedCartItems };
        const db = getDb();

        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: updatedCart } }
            );
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => i.productId);

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => products.map(p => {
                console.log(p);
                return {
                    ...p,
                    quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
                }
            }));
    }

    static findById(userId) {
        const db = getDb();

        return db.collection('users').findOne({ _id: new ObjectId(userId) });
    }
}

module.exports = User;