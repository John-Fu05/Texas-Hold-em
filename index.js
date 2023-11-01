const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const User = require('./user.js')


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


var stage = 0
var flop = ['', '', '']
var turn = ['']
var river = ['']
var temp = []; // temp array for each game
var total_pot =0; // pot in the room
var check_index = 0;
var ready_index = 0;
var counter = 0;
var IDs = [];
var fold_list =[];

// s --> heart
// l --> dime
// p --> spade
// k --> club
const deck = ['sa', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'sj', 'sq', 'sk',
              'pa', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'pj', 'pq', 'pk',
              'la', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'lj', 'lq', 'lk',
              'ka', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'kj', 'kq', 'kk']


io.on('connection', (socket) => {
  const a = new User(socket.id);
  console.log('user    ' + socket.id + '    connected');
  IDs.push(a);
  io.to(a.ID).emit('ID message', a.ID);
  //when user disconnect
  socket.on('disconnect', () => {
    //reset everything 
    console.log('user    ' + socket.id + '    disconnected');
    IDs = IDs.filter(User => User.ID != socket.id);
    resetOnServer();
    io.emit('reset game');
  });
});


io.on('connection', (socket) => {

  //when user check/bet increase counter
  socket.on('counter message', ()=> {
    counter++;
  })

  //when user fold
  socket.on('fold message', (arg)=> {
    fold_list.push(arg);
  })

  socket.on('check message', ()=> {
    
    // ———————————————目前程序正常使用———————————————————————————————————————————//
    // fold 逻辑有问题 到底在哪check_index++
    //html中到底先 check message 还是先fold message
    // enable message when on turn
    //fold本质-- fold 之后发送check message（对于本轮）， 发送给服务器id 组成list
    //检查目前序列中这个人在不在list中 在的话跳过到下一个人（几个人）
    // if(!fold_list.includes(IDs[counter % IDs.length].ID)){

    // ——————————————————————————————————————————————————————————————————————//
    io.to(IDs[counter % IDs.length].ID).emit("on turn");
    //   console.log('im here -- 1');
      
    // } 

    //
    check_index++;
    //


    console.log('im here -- 2');
    
    //second stage
    if (check_index == (IDs.length -fold_list.length) && stage ==1){

      // print pot and flop message
      io.emit('chat message', "current pot is:  " + total_pot);

      //display the flop to the screen
      io.emit('display', flop[0], 0);
      io.emit('display', flop[1], 1);
      io.emit('display', flop[2], 2);

      stage = 2
      check_index = 0
      //update stage to client
      io.emit('stage check', stage);
    }

    //third stage
    if (check_index == (IDs.length -fold_list.length) && stage ==2){

      //print total pot and turn
      io.emit('chat message', "current pot is:  " + total_pot);
      // io.emit('chat message','Turn' + [flop[0], flop[1], flop[2], turn[0]].join());

      //display the turn on screen
      io.emit('display', turn[0], 3);


      stage = 3
      check_index = 0;
      //update stage to client
      io.emit('stage check', stage);
    }

    //fourth stage
    if (check_index == (IDs.length -fold_list.length) && stage ==3){
      //print current pot and river 
      io.emit('chat message', "current pot is:  " + total_pot);
      //display the river on screen
      io.emit('display', river[0], 4);


      stage = 4
      check_index = 0;
      //update stage to client
      io.emit('stage check', stage);
    }

    //fifth stage-- 
    //1.who to send money --- not solved
    //2.ready for new game
    if(check_index == (IDs.length -fold_list.length) && stage == 4){
      //reset everything
      resetOnServer();
      io.emit('reset game');
    }
    
  })


  // checking if all users r ready 
  socket.on('ready message', ()=> {
  ready_index++;
  
  // check game start condition
  if (ready_index == IDs.length){
    if (stage == 0) {
      //shuffle the deck 
      temp = deck;
      shuffle(temp);
 
      //send flip card 
      flop[0] = temp[47]
      flop[1] = temp[48]
      flop[2] = temp[49]
      turn[0] = temp[50]
      river[0] = temp[51]

      for (let i = 0; i < IDs.length; i++){
        IDs[i].setHand(temp[2*i],temp[2*i+1]);
        // send first card to user
        io.to(IDs[i].ID).emit('display',IDs[i].firstCard, 5);
        // send second card to user
        io.to(IDs[i].ID).emit('display',IDs[i].secondCard, 6);
      }
      stage = 1
      io.emit('stage check', stage);
      io.emit('game start');
      if(!fold_list.includes(IDs[counter % IDs.length].ID)){
        io.to(IDs[counter % IDs.length].ID).emit("on turn");
      }

    }}
  })

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  //calculate the bet and print
  socket.on('get bet', (arg)=> {
    io.emit('chat message', 'User bet: ' +arg+'  bet  ' +arg+ '  to follow');
    total_pot = total_pot + Number(arg);
  })
});


io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function shuffle(array)  {
  array.sort(() => Math.random() - 0.5)
}

function resetOnServer() {
  check_index = 0;
  ready_index = 0;
  stage =0;
  flop = ['', '', '']
  turn = ['']
  river = ['']
  temp =[];
  total_pot =0;
  counter = 0;
  fold_list = [];
}