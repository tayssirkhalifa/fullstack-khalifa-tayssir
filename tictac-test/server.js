
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(bodyParser.text());
var date_de_token;
var mot_par_jours;


app.post('/api/justify', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err) => {

        if (err) {
            res.sendStatus(403);
            return;
        }
        else {
            justifierText(req.body, req.token);
        }

    });

    function justifierText() {

        res.type("text/plain");
        var text = req.body;
        var date_sys = new Date();
        if (!text) {
            res.send('');
            return;
        }
        if (date_de_token == "") {
            res.json("vous devez d'abord vous authentifier")
        }
        console.log("day of token" + date_de_token)
        console.log(date_sys.getDay())
        if (date_de_token !== date_sys.getDay()) {
            console.log("hahahha")
            date_de_token = new Date();
            mot_par_jours = 0;
        }
        if (mot_par_jours + text.length > 80000) {
            res.status(402).json({ message: '402 Payment Required.' });

        }
        mot_par_jours += text.length
        console.log(mot_par_jours)
        var cmp = 79;
        var newtext = "";
        var j;
        text = text.replace(/\s\s+/g, ' ');
        for (var i = 0; i < text.length; i++) {
            newtext += text[i];
            if (i == cmp) {
                if (text[i] == ' ' || text[i] == ',') {
                    newtext += '\n';
                    cmp = i + 80;
                }
                else {
                    j = 0;
                    while (text[i] !== ' ' && text[i] !== '.' && text[i] !== ',') {
                        i = i - 1;
                        j++;
                    }
                    newtext = newtext.substr(0, newtext.length - j);
                    newtext += '\n';
                    cmp = i + 80;
                }
            }
        }
        res.send(ajouter_des_espace(newtext));
    }





});

app.post('/api/token', (req, res) => {
    const user = {
        email: req.body.email
    }

    if (user.email === "foo@bar.com") {
        jwt.sign({ user }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
            date_de_token = new Date().getDay();
            mot_par_jours = 0;
            res.json({
                token
            });
        });
    }
    else {
        res.json("email incor")
    }
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // verify-token ne marche pas
        res.sendStatus(403);
    }
}

function ajouter_des_espace(text) {

    var lines = text.split(/\n/);

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i].trim();

        if (line.length >= 80) {
            continue;
        }
        var k = 1;
        for (var j = 0; j < line.length; j++) {
            if ((line[j] == " " || line[j] == "," || line[j] == ".") && line.length < 80) {
                line = line.substr(0, j) + "  " + line.substr(j + 1, line.length)
                j = j + k;
            }
            if (j == line.length - 1 && line.length < 80) {
                j = 0;
                k++;
            }
        }
        lines[i] = line;
    }
    return lines.join("\n");

}




app.listen(3000, () => console.log(' http://localhost:3000`'));