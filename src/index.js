const express = require('express');
const dotenv =  require("dotenv")
const cors =  require("cors")
const app = express();
const morgan = require('morgan')
// settings
app.set('port', process.env.PORT || 3000);
dotenv.config();

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// routes
app.use('/api', require('./routes/index'))

//starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`)
})
