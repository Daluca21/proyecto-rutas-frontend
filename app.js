const express = require('express');
const app = express();
const registro = require('./routes/registro');
const login = require('./routes/login');
const perfil = require('./routes/perfil');
const admin = require('./routes/admin');
const session = require('express-session');

app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: false
}));

//Estableciendo el motor de plantillas
app.set('view engine','ejs');
app.use(express.static('public'));

//Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));

//además le decimos a express que vamos a usar json
app.use(express.json());

 //Establecemos las rutas para las VISTAS usando un archivo aparte (router.js) y la clase Router()
app.use('/', require('./router'));
app.use('/registro', registro);
app.use('/login', login);
app.use('/perfil', perfil);
app.use('/admin', admin);

app.listen(3000, ()=>{
    console.log('SERVER corriendo en http://localhost:3000');
});