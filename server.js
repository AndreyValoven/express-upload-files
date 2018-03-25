const express = require('express');
const pug = require('pug');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, cd) {
        console.log(req.my);
        cd(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Inti upload
const upload = multer({
    storage: storage,
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

app.post('/upload', (req, res) => {
    req.my = 'test';
    console.log('Upload image');
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            res.render('index', {
                msg: err
            });
        } else {
            console.log(req.file);
            res.render('index', {
                file: `uploads/${req.file.filename}`
            })
        }
    });

})


app.listen(PORT, () => console.log("start server"));