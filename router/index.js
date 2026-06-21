const pg_client = require('../config/pgconfict');

module.exports = function (app) {
    app.get('/home', (req, res) => {
        res.render('home');
    });
}
/* app.js index.js router/user.js src/base/appEnvironmentBuilder.js src/users/CreateUser.js */