var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var fsold = require('fs');


var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));


//Get a list of all the files in the directory

app.get('/upload', function(req, res){

        fs.readdir( __dirname + '/public/file/', function(err, files) {

            if (err) {

                res.send(err);
            }
            res.json(files); // return all files in JSON format
        });
 
});


//Upload a file to the dirrectory

app.post('/upload', function (req, res, next) {
        var fstream;


        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

            console.log ("filename: " + filename);
 
         //Changing filename to the text entered

            console.log ("fieldname: " + fieldname);
            console.log ("encoding: " + encoding);
            console.log ("mimetype: " + mimetype);

            //Path where file will be uploaded with original filename
            fstream = fs.createWriteStream(__dirname + '/public/file/' + filename);
            file.pipe(fstream);

            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                res.redirect('back');           //where to go next
            });
        });


    });

var server = app.listen(3031, function() {
    console.log('Listening on port %d', server.address().port);
});