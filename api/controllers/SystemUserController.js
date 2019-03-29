/**
 * Created by Morgan on 14-11-07.
 */


var data = [{
    name: 'ACORN',
    privilege: 'ADMIN',
    status: 'ACTIVE',
    password: 'acorn'
}, {
    name: 'CETC',
    privilege: 'USER',
    status: 'LOCKED',
    password: 'cetc'
}, {
    name: 'Production',
    privilege: 'ADMIN',
    status: 'ACTIVE',
    password: 'production'
}];

module.exports = {
    systemusers: function (req, res) {
        res.json(data);
    },
    deleteUser: function (req, res) {
        data.splice(req.body.data, 1);
        res.json(data);
    },
    changeStatus: function (req, res) {
        data[req.body.data.index].status = req.body.data.status;
        res.json(data);
    },
    createUser: function (req, res) {
        data = data.concat(req.body.data);
        res.json(data);
    },
    editUser: function (req, res) {
        data[req.body.data.index] = req.body.data.user;
        res.json(data);
    }
};
