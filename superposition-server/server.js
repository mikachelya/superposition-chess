const WS = require('ws');
const PORT = 80;
const wss = new WS.Server({
    port: PORT
}, () => console.log(`ws server live on ${PORT}`));

const queue = new Map();

wss.on('connection', (socket) => {
    // console.log('something connected');
    
    socket.onmessage = room => {
        room = room.data;
        
        if (queue.has(room)) {
            let partner = queue.get(room);
            queue.delete(room);
            return pairPlayers(socket, partner);
        }
        
        queue.set(room, socket);
        socket.onclose = _ => {if (queue.get(room) == socket) queue.delete(room)};
        socket.onmessage = undefined;
    };
});


function pairPlayers(wsA, wsB) {
    wsA.partner = wsB;
    wsB.partner = wsA;

    wsA.onmessage = forwardMove;
    wsB.onmessage = forwardMove;

    let colour = Math.random() >= 0.5;
    wsA.colour = colour;
    wsB.colour = (!colour);
    wsA.send(wsA.colour.toString());
    wsB.send(wsB.colour.toString());

    // console.log("players paired");
}

function forwardMove(move) {
    // console.log("recieved move", move.data);
    let message = {};
    message.contents = move.data;
    message.origin = move.target.colour;
    message.timestamp = Date.now();
    message = JSON.stringify(message);
    console.log(message);

    move.target.partner.send(message);
    move.target.send(message);
}