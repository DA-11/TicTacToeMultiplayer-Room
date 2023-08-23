const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');

const io = socketio(server, {
    cors: {
        origin: "*"
    }
});

const path = require('path');
const {Game} = require("./game.js");
app.use(express.static(path.join(__dirname,'frontend')));
let winningCombinations = [
    [0,1,2],
    [0,3,6],
    [3,4,5],
    [1,4,7],
    [6,7,8],
    [2,5,8],
    [0,4,8],
    [2,4,6]
 ];
 
let winSet;

let rooms = {};
io.on('connection', (socket)=>{
    
    socket.on('joinRoom', (roomName)=>{
        if(rooms[roomName] === undefined){
           
            rooms[roomName] = 1;
            socket.join(roomName)
            socket.emit('valid','player1');

        } else if(rooms[roomName] === 1){
            rooms[roomName] = 2;
            
            socket.join(roomName)
            socket.emit('valid','player2');

            let game = new Game();
            game.roomName = roomName;
            rooms[roomName] = game;

            io.to(roomName).emit('start', game);

        } else {
            socket.emit('invalid');
        }

        return;
    });

    socket.on('playYourTurn', (room) => {
        rooms[room.roomName] = room
        
        if(room.moves === 9){
            io.to(room.roomName).emit('draw');
            return;
        }

        if(checkWinner(room.grid) === true){
            io.to(room.roomName).emit('gameOver',winSet);
        }

        io.to(room.roomName).emit('turn',room);
    })
    
    socket.on('clientDisconnect', (roomName) => {
        console.log(roomName);
        rooms[roomName] = undefined;
        io.to(roomName).emit('playerDisconnected');
    })

    socket.on('restart', (room)=>{
        io.to(room.roomName).emit('restartRequest');
    })

    socket.on('restartRequestResponse',(response)=>{
        console.log(response);
        io.to(response[0].roomName).emit('restartResponse',response[1]);
    })
   
})


function checkWinner(grid){
    if(areEqual(grid[0][0],grid[0][1],grid[0][2],0) || 
    areEqual(grid[0][0],grid[1][0],grid[2][0],1) || 
    areEqual(grid[1][0],grid[1][1],grid[1][2],2) || 
    areEqual(grid[0][1],grid[1][1],grid[2][1],3) || 
    areEqual(grid[2][0],grid[2][1],grid[2][2],4) || 
    areEqual(grid[0][2],grid[1][2],grid[2][2],5) || 
    areEqual(grid[0][0],grid[1][1],grid[2][2],6) || 
    areEqual(grid[0][2],grid[1][1],grid[2][0],7)){
        return true;
    }

    return false;

}

function areEqual(a,b,c,combination){
    if((a === b && b === c) && (a !== -1 || b !== -1 || c !== -1)){
        winSet = winningCombinations[combination];
        return true;
    
    } 
    return false;
}

server.listen(3003, () => {
    console.log("server listenig at 3003");
})