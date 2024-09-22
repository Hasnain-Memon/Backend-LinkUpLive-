import { Server, Socket } from "socket.io";

let users = new Map<string, string>();
let rooms = new Map<string, string[]>();

const io = new Server(8000, {
    cors: {
        origin: "*",
        credentials: true
    },
});

io.on("connection", (socket: Socket) => {
    console.log("user joined", socket.id);

    socket.on('init-room', ({name, roomId}) => {
        try {
            if(!name || !roomId){
                console.log("name or roomId not found");
                return;
            }

            users.set(name, socket.id);

            rooms.set(roomId, [socket.id]);
            console.log("room created", rooms);
        } catch (err) {
            console.error("Error initializing room", err);
        }
    });

    socket.on('join-room', ({name, roomId}) => {
        try {
            if(!name || !roomId) {
                console.log("name or roomId not found");
                return;
            }

            const users = rooms.get(roomId) || [];

            users.push(socket.id);
            rooms.set(roomId, users);

            const creatorSocketId = users[0];
            if (!creatorSocketId) {
                console.log('creator socket not found!');
                return;
            }

            socket.to(creatorSocketId).emit('user:joined', {name, id: socket.id});

            console.log('room state after joining room:', rooms);
        } catch (err) {
            console.log("Error joining room", err);
        }
    })

    socket.on('disconnect', () => {
        console.log("user disconnected", socket.id);
    });
});