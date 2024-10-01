"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
let users = new Map();
let rooms = new Map();
const io = new socket_io_1.Server(8000, {
    cors: {
        origin: "*",
        credentials: true
    },
});
io.on("connection", (socket) => {
    console.log("user joined", socket.id);
    socket.on('init-room', ({ name, roomId }) => {
        try {
            if (!name || !roomId) {
                console.log("name or roomId not found");
                return;
            }
            users.set(name, socket.id);
            rooms.set(roomId, [socket.id]);
            console.log("room created", rooms);
        }
        catch (err) {
            console.error("Error initializing room", err);
        }
    });
    socket.on('join-room', ({ name, roomId }) => {
        try {
            if (!name || !roomId) {
                console.log("name or roomId not found");
                return;
            }
            const users = rooms.get(roomId) || [];
            users.push(socket.id);
            rooms.set(roomId, users);
            socket.join(roomId);
            const creatorSocketId = users[0];
            if (!creatorSocketId) {
                console.log('creator socket not found!');
                return;
            }
            io.to(creatorSocketId).emit('user:joined', { name, id: socket.id });
            console.log('room state after joining room:', rooms);
        }
        catch (err) {
            console.log("Error joining room", err);
        }
    });
    socket.on('offer', ({ offer, to, name }) => {
        try {
            console.log("Offer received on server from:", socket.id, "to:", to);
            if (!offer || !to) {
                console.log("offer or to(peerId) is missing");
                return;
            }
            io.to(to).emit('test:event', { message: "This is test message" });
            io.to(to).emit('receive-offer', { offer, from: socket.id, remoteName: name }, (ack) => {
                console.log('Offer sent, awaiting client response');
            });
        }
        catch (error) {
            console.error("Error sending offer to the peer", error);
        }
    });
    socket.on('answer', ({ answer, to }) => {
        try {
            if (!answer && !to) {
                console.log("answer and to(creatorId) is missing");
                return;
            }
            io.to(to).emit('receive-answer', { answer, from: socket.id });
        }
        catch (error) {
            console.log('Error sending answer to the room creator', error);
        }
    });
    socket.on('disconnect', () => {
        console.log("user disconnected", socket.id);
    });
});
