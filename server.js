const express = require('express');
const AWS = require('aws-sdk');
const pug = require('pug');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');

const config = new AWS.Config({
    accessKeyId: '<id>',
    secretAccessKey: '<key>',
    region: '<region>'
});

const s3 = new AWS.S3();

// Inti upload
const upload = multer({
    storage: multer.memoryStorage(),
    fimits: {
        fileSizr: 5 * 1024 * 1024
    },
    fileFilter: function(req, file, cb) {
        // Check File Type
        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Ckeck mine
        const mimetype = filetypes.test(file.mimetype);

        if(mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('myImage');


// Init app
const app = express();
const PORT = 3000;

// View engine
app.set('view engine', 'pug');

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload',  (req, res) => {
    console.log('Upload image');
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            res.render('index', {
                msg: err
            });
        } else {
            const file =  req.file.originalname;
            const s3Params = {
                Bucket: '<Bucket name>',
                Body: req.file.buffer,
                Key: file,
                ContentType: req.file.mimetype,
                ACL: 'public-read'
            }

            s3.putObject(s3Params , (err, data) => { 
                if (err) return res.status(400).send(err);
                console.log(data);
            });

            var params = {Bucket: '<Bucket name>', Key: file};
            var url = s3.getSignedUrl('getObject', params);
            console.log(url);
            res.render('index' , {
                file: `https://s3.eu-west-2.amazonaws.com/${ params.Bucket }/${ file }`
            });
        }
    });
    
})


app.listen(PORT, () => console.log("start server"));