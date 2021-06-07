const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,userLeave,getRoomUsers } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot';



io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {


        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit('message', formatMessage(botName, 'whelcome massage ChatOrd!'));

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has join massage!`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })

    });


 


    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left massage!`))

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            })
        }
    })

})

const PORT = 3000 || process.env.PORT


server.listen(PORT, () => console.log(`Server running on port ${PORT}`))