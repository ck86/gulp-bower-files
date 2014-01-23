var gulpBowerFiles = require("../");
var es = require("event-stream");
var path = require("path");
var should = require("should");

describe('gulpBowerFiles()', function () {
    var opts = {
        paths: {
            bowerJson: __dirname + "/bower.json",
            bowerrc: __dirname + "/.bowerrc"
        }
    };

    it('should select the expected files', function (done) {
        var stream = gulpBowerFiles(opts);

        var expectedFiles = [
            path.join(__dirname, "/fixtures/simple/simple.js"),
            path.join(__dirname, "/fixtures/overwritten/another.js"),
            path.join(__dirname, "/fixtures/multi/multi.js"),
            path.join(__dirname, "/fixtures/multi/multi.css"),
        ];

        var srcFiles = []

        stream.on("end", function(){
            srcFiles.should.be.eql(expectedFiles);
            done();
        });

        stream.pipe(es.map(function(file, callback){
            srcFiles.push(file.path);
            callback();
        }));
    });
});