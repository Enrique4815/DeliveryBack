require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const session = require('express-session');

/*
* IMPORTAR RUTAS
*/
const usersRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const ordersRoutes = require('./routes/orderRoutes');

const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');

app.set('port', port);

const upload = multer({
    storage: multer.memoryStorage()
});

/*
* LLAMADO DE LAS RUTAS
*/
usersRoutes(app, upload);
categoriesRoutes(app, upload);
productRoutes(app, upload);
addressRoutes(app);
ordersRoutes(app);


app.use(session({
    secret: 'L}pG46~Qw*4]srvTSk:Oh[@)]%ZBz;XC', // Clave secreta para firmar las sesiones
    resave: false, // Evita guardar la sesión si no ha sido modificada
    saveUninitialized: false, // No guarda sesiones no inicializadas
    cookie: { secure: false } // Asegúrate de usar 'true' solo en HTTPS
}));


server.listen(port, function(){
    console.log('Aplicación de NodeJS ' + process.pid + ' Iniciada...')
})

app.get('/', (req, res) => {
    res.send('Ruta raiz del backend')
});

app.get('/test', (req, res) => {
    res.send('Este es la ruta TEST')
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
      res.send('Bienvenido al perfil de usuario');
    } else {
      res.redirect('/login');
    }
});


app.use(passport.initialize());
app.use(passport.session());

// 200 -ES UNA RESPUESTA EXITOSA
// 404 - SIGNIFICA QUE LA URL NO EXISTE
// 500 - ERROR INTERNO DEL SERVIDOR