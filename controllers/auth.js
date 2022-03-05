const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
}

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'isLoggedIn=true');

    User.findById('6220aaf094f22ac3aa7381d2')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
}

exports.postLogOut = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}