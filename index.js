const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var stage = 0
var first_hand = ['', '']
var second_hand = ['', '']
var flop = ['', '', '', '', '']
var turn = ['']
var river = ['']
//temp array for each game
var temp = []

var ready_index = 0;


var IDs = []

const deck = ['AH', ' 2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH',
              'AS', ' 2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS',
              'AD', ' 2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD',
              'AC', ' 2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC']


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('./images'));

io.on('connection', (socket) => {
  ///////
  socket.on('message_container', () => {
    io.emit('message_container', socket.id);
  });
  ////
  //console.log(socket.id);
  console.log('a user connected');
  IDs.push(socket.id);
  

  socket.on('disconnect', () => {
    console.log('user disconnected');
    IDs.pop();
  });
});

io.on('connection', (socket) => {
  // checking if all users r ready 
  socket.on('ready message', ()=> {
  ready_index++;
  console.log(ready_index);

  //check game start condition
  if (ready_index == IDs.length){
    
    if (stage == 0 && IDs.length == 2) {
      //shuffle the deck 
      temp = deck;
      shuffle(temp);
      //send user card
      first_hand[0] = temp[5]
      first_hand[1] = temp[6]
      second_hand[0] = temp[7]
      second_hand[1] = temp[8]
      //send flip card 
      flop[0] = temp[0]
      flop[1] = temp[1]
      flop[2] = temp[2]
      turn[0] = temp[3]
      river[0] = temp[4]
      
      //need to be fixed 
      io.to(IDs[0]).emit('chat message','first user has: ' + [first_hand[0], first_hand[1]].join());
      io.to(IDs[1]).emit('chat message','second user has: ' + [second_hand[0], second_hand[1]].join());
      // io.to(IDs[IDs.length-1]).emit('chat message', 'blah blah blah' + IDs[IDs.length-1])

      stage = 1

    } 
  }
  
  // //second stage
  // if (msg === 'a'){
  //   console.log('im here1111')
  //   check_index++;
  //   if (check_index == 2 && stage ==1) {
  //     io.emit('chat message','Flop: ' + [flop[0], flop[1], flop[2]].join());
  //     stage = 2
  //     check_index = 0
  //   }
    
  // }

  // //third stage
  // if (msg === 'b'){
  //   console.log('im here2222')
  //   check_index++;
  //   if (check_index == 2 && stage ==2) {
  //     io.emit('chat message','Turn' + [flop[0], flop[1], flop[2], turn[0]].join());
  //     stage = 3
  //     check_index = 0
  //   }
  // }

  // //fourth stage
  // if (msg === 'c'){
  //   console.log('im here3333')
  //   check_index++;
  //   if (check_index == 2 && stage == 3){
  //     io.emit('chat message','River' + [flop[0], flop[1], flop[2], turn[0], river[0]].join());
  //     stage = 4
  //     check_index = 0
  //   }
  // }


})

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

// io.on('connection', (socket) => {
//   socket.broadcast.emit('hi');
// });




server.listen(3000, () => {
  console.log('listening on *:3000');
});

function shuffle(array)  {
  array.sort(() => Math.random() - 0.5)
}


