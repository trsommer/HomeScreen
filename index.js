var express = require('express');
var fs = require('fs');
var app = express();
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(express.json());

app.get('/', function (req, res) {
    res.render('index.html');
});

app.post('/updateJSON', function(request, response){
    var json = request.body
    updateJSON(json)
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

function updateJSON(json) {
    //write json to public/homeScreenData.json
    fs.writeFile("public/homeScreenData.json", JSON.stringify(json), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}