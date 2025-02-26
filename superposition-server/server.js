const WS = require('ws');

const PORT = 80;

const wss = new WS.Server({
  port: PORT
}, () => console.log(`ws server live on ${PORT}`));

const errHandle = (err) => {
  if(err) throw err;
}

wss.on('connection', (socket) => {
  console.log('something connected');

  socket.send('you are connected', errHandle);

  socket.on('message', (data) => {
    console.log(`socket sent ${data}`);

    socket.send('message received', errHandle);
  })
})