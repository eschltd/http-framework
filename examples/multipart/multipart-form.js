var inject = require("multi-keyval")
var Form = require("multiparty").Form

module.exports = MultipartForm

function MultipartForm(formOpts) {
    return function (req, res, opts, cb) {
        var form = new Form(formOpts || {})
        var fields = {}

        function update(key, value) {
            inject(fields, key, value)
        }

        function finish() {
            cb(null, fields)
        }

        form.on("field", update)
        form.on("file", update)
        form.once("error", cb)
        form.once("close", finish)
        form.parse(req)
    }
}
