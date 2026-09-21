
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');



const app = express();
const server = http.createServer(app);

// A map to hold memory-cached Yjs Docs per room on the server
const docs = new Map();

// making a socket connection with the client
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

//listening the 'connection' event
io.on('connection', socket => {
    console.log('user connected:' + socket.id);

    // team joins a specific collaborative room
    socket.on('join-room', data => {
        const { username, roomId } = data;

        // join the isolated socket.io room
        socket.join(roomId);
        console.log(`User ${username} joined the room: ${roomId}`);

        // notify other team members in that room only
        // socket.to(roomId).emit('user-joined', {
        //     message: `${username} has joined the collaboration session`,
        //     username: username
        // });
    });

    // handle synchronized collaboration change
    socket.on('send-collaboration-update', data => {
        const { roomId, content } = data;

        // broadcast the update only to the specific room, excluding the sender
        socket.to(roomId).emit('receive-collaboration-update', content);
    });

    // Event: cleanup when a user leaves or closes the browser
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {

            // A socket can be in multiple rooms; we iterate over them
            if(room !== socket.id) { // Exclude the socket's private room id
                socket.to(room).emit('user-left', {
                    message: 'A team member is disconnected'
                });
            }
        });
    });

    // consoling a disconnect message after user left
    socket.on('disconnect', () => {
        console.log('user disconnected:' + socket.id);
    });

});

app.get('/', (req, res) => {
    res.send('Hi there!');
});



// listening to the server
server.listen(8000, () => {
    console.log('server is listening to the port no: 8000!');
});