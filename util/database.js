const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://demoShop:demoShop123@cluster0.4i8kb.mongodb.net/demoShop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if (_db) return _db;
    throw 'Database not found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;