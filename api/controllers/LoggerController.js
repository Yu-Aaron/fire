var logFiles = require(__dirname + '/../../log_mock_files/log_files2.json');
var log = '';

module.exports = {

    mocklogs: function (req, res) {
        res.json(logFiles);
    },

    createLog: function (req, res) {
        //console.log(req.body);
        log = req.body.data;
        res.json({'log': log});
    }
};
