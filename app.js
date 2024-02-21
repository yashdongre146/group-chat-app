// const http = require('http');
// const {createServer} = require('node:http');
// const {Server} = require('socket.io')

const express = require('express')
const bodyParser = require('body-parser')
const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const User = require('./models/user')
const ForgotPassword = require('./models/forgotPassword')
const sequelize = require('./util/database')
const cors = require('cors')
const helmet = require('helmet')
const Group = require('./models/group')
const Groupmembers = require('./models/groupmembers')
const Groupmessage = require('./models/groupmessage')
const socketIO = require('socket.io');


const app = express();
// const server = createServer(app);
// const io = new Server(server);

require('dotenv').config();

// io.on('connection', socket => {
//     console.log("Connection successful");
//     socket.on('send', userMessage=>{
//         console.log("message received");
//         socket.broadcast.emit('receive', {message: userMessage.message})
//     })
// })


app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/',(req, res)=>{
    res.sendFile('signup.html', {root: 'views'});
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', {root:'views'});
});

app.get('/reset-password', (req, res) => {
    res.sendFile('forgotpassword.html', {root:'views'});
});

app.get('/home', (req, res) => {
    res.sendFile('dashboard.html', {root:'views'});
});

app.use(userRoutes);
app.use(chatRoutes);

app.use(helmet());

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);
Group.belongsToMany(User, { through: 'Groupmembers' });
User.belongsToMany(Group, { through: 'Groupmembers' });

User.hasMany(Groupmessage);
Groupmessage.belongsTo(User);

Group.hasMany(Groupmessage);
Groupmessage.belongsTo(Group);


const PORT = process.env.PORT;

sequelize.sync().then(()=>{
    const server = app.listen(3000);

    // Pass the HTTP server to Socket.IO
    const io = socketIO(server, {
        cors: {
            origin: ['http://localhost:3000']
        }
    });

    io.on('connection', socket => {
        console.log("Connection successful");
        socket.on('send', (data)=>{
            io.emit('receive', {message: data.message, name: data.decodedToken.name, id: data.decodedToken.id})
        })
    })
}).catch(err=>console.log(err))
