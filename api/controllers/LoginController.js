/**
 * Created by Morgan on 14-10-22.
 */
module.exports = {
    get: function (req, res) {
        var data = [{
            name: 'ACORN',
            password: 'acorn',
            privilege: "admin",
            status: "ACTIVE"
        }, {
            name: 'CETC',
            password: 'cetc',
            privilege: "user",
            status: "LOCKED"
        }];

        if (req.query.name) {
            var name = req.query.name;
            var user = {};
            for (var a = 0; a < data.length; a++) {
                if (data[a].name == name) {
                    user = data[a];
                }
            }
            if (user) {
                res: json({
                    data: user
                });
            } else {
                res.status(500).send('no user found');
            }

        } else if (req.body.name && req.body.pass) {
            var name = req.body.name;
            var pass = req.body.pass;
            var result = {};
            for (var a = 0; a < data.length; a++) {
                if (data[a].name == name && data[a].password == pass) {
                    result = data[a];
                }
            }
            if (result.name) {
                if (result.status == 'ACTIVE') {
                    var token = 'a63187178b124861d6fc1360c099672c';
                    res.cookie('token', token, {
                        httpOnly: true
                    });
                    res.json(result);
                } else {
                    res.status(500).send('LOCKED');
                }
            } else {
                res.status(500).send('NO_USER');
            }
        } else {
            res.status(500).send('NO_USER');
        }
    }
};