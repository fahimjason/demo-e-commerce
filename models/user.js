const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const objectId = mongodb.ObjectId;
class User {
    constructor(username, email) {
        this.name = username;
        this.email = email;
    }

    save() {
        const db = getDb();

        return db.collection('users')
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static findById(userId) {
        const db = getDb();

        return db.collection('users').findOne({ _id: new objectId(userId) });
    }
}

module.exports = User;