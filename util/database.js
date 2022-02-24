const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://nodeCourse:nodeCourse123@cluster0.4i8kb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected');
            callback(client);
        })
        .catch(err => console.log(err));
}

module.exports = mongoConnect;