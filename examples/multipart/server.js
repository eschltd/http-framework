// based on https://github.com/visionmedia/express/blob/master/examples/multipart/index.js
var http = require("http")
var fs = require("fs")
var util = require("util")
var Router = require("routes-router")
var sendHtml = require("send-data/html")
var MultipartForm = require("./multipart-form.js")

// Configure a form parser to place any files into a temporary directory.
// You should avoid making the temporary directory accessible from the web to
// prevent potential code injection attacks. Ensure the directory has
// read/write permissions for the node process user and no execute permission.
var form = MultipartForm({

})

var app = Router()

app.addRoute("/", {
    GET: function (req, res) {
        sendHtml(req, res,
            "<form method='post' enctype='multipart/form-data'>" +
            "<p>Title: <input type='text' name='title' /></p>" +
            "<p>Image: <input type='file' name='image' /></p>" +
            "<p><input type='submit' value='Upload' /></p>" +
            "</form>")
    },
    POST: function (req, res, opts, cb) {
        // Parse the multipart form, storing any files to the specified
        // (or temporary) location. Callback will contain the posted form fields
        form(req, res, null, function (err, fields) {
            if (err) {
                return cb(err)
            }

            // The title field is a string on the fields object
            var title = fields.title

            // The image field is an object representation
            // { }
            var image = fields.image

            // stat the file to figure out how large it is
            fs.stat(image.location, function (err, stat) {
                if (err) {
                    return cb(err)
                }

                var message = util.format("uploaded %s (%d Kb) to %s as %s",
                    image.filename,
                    Math.round(stat.size / 1024),
                    image.location,
                    title)

                // We will now remove the file from the temporary directory.
                // In production you should upload to s3 or move to a permanent
                // location after checking the file contents. Again, if you move
                // the file to a directory, you should ensure that file
                // permissions for the user are appropriate.
                fs.unlink(image.location, function (err) {
                    if (err) {
                        return cb(err)
                    }

                    sendHtml(req, res, message)
                })
            })
        })
    }
})

var server = http.createServer(app)
server.listen(3000)
console.log("multipart server listening on port 3000")
