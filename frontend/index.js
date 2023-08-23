const socket = io();
let playOrStop = 1;
let playerInfo;
let roomName;
let grid;
let myTurn = false;//
let started = false;//
let playerElement;
let restartFlag = false;
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
let cancelTimeOut;
const screen = document.getElementsByClassName('screen')[0];

screen.addEventListener('click', (event)=>{
    
    if(event && event.target.matches('#joinRoom')){
    
        const val = document.getElementById('roomName').value;
        if(val.length === 0){
            document.getElementsByClassName('fillInfo')[0].innerHTML += `
                &#x274C;Room name should be atleast 1 character long</div>
                `;
            setTimeout(()=>{
                document.getElementsByClassName('fillInfo')[0].innerHTML = ``;
            },3000)
            
        } else {
            socket.emit('joinRoom',val);
           
        }

    }

    if(event && 
        event.target.matches('#block0') ||
        event.target.matches('#block1') ||
        event.target.matches('#block2') ||
        event.target.matches('#block3') ||
        event.target.matches('#block4') ||
        event.target.matches('#block5') ||
        event.target.matches('#block6') ||
        event.target.matches('#block7') ||
        event.target.matches('#block8')
    ){
        playmove(event.target.id);
    }

  
    if(event && event.target.matches('.restart') || event.target.matches('.restartButton')){
        reset();
    }

    console.log(event);

    if(event.target.matches('.restartOptionYes') || event.target.matches('.restartOptionNo')){
        
        let response = [];
        response.push(playerInfo);
        
        if(event.target.matches('.restartOptionYes')){
            response.push(true);    
            socket.emit('restartRequestResponse',response);
        } 


        if(event.target.matches('.restartOptionNo')){
            response.push('false');
            socket.emit('restartRequestResponse',response);
        }
    }

    if(event && event.target.matches('.music') || event.target.matches('.music-icon') || event.target.matches('.slash')){
        playOrStop = playOrStop === 1 ? 0 : 1;
        playOrStop === 1 ? playbackgroundMusic() : stopbackgroundMusic();
    }
})


socket.on('valid',(playerData)=>{

    if(playerData === 'player1'){
        myTurn = true;
        playerElement = 'X';
    } else if(playerData === 'player2'){
        myTurn = false;
        playerElement = 'O';
    }

    screen.innerHTML = `
            
    <canvas id="confetti"></canvas>
    <div class="header">
       
        <div class="heading">
            TIC TAC TOE
            
        </div>
       
    </div>
  
    <div class="music">
        <img class="music-icon" src="images/icons8-speaker-50.png">
        <div class="slash" >/</div>
    </div>

   <div class="restart">
        <button class="restartButton">Restart</button>
    </div>

    <div class="askRestartContainer"></div>
    <!--
   
        <div class="restartMessage">Opponent wants to restart the Match <br> Continue ?</div>
        <div class="restartOptions">
            <button class="restartOptionYes" >YES</button>
            <button class="restartOptionNo" >NO</button>
        </div>
    
    -->
    <!--
    
        <div class="restartMessage">Restart Request Sent to Opponent.</div>
        <div class="replyLoader">
            <div>Waiting for Reply</div>
            <div class="loader"></div>
        </div>
   
    -->
    <div class="game">
        <div class="block" id="block0"></div>
        <div class="block" id="block1"></div>
        <div class="block" id="block2"></div>
        <div class="block" id="block3"></div>
        <div class="block" id="block4"></div>
        <div class="block" id="block5"></div>
        <div class="block" id="block6"></div>
        <div class="block" id="block7"></div>
        <div class="block" id="block8"></div>

    </div> 
    
    <div class="information">

        <div class="loading">
            
            <div class="loading-info"></div>
        </div>
        
    </div>
    <div class="footer">
        <div class="footer-message">Hi There &#128075;  Thanks for checking out this site&#11088; </div>
        <div class="footer-logos">
            <div class="findme">Find me On:</div>
            <a href="https://www.linkedin.com/in/divyansh-acharya-870a661bb/"><img class="logo1" src="images/Daco_368194.png"></a> 
        </div>
    </div>
        `;
})

socket.on('invalid',()=>{
    document.getElementsByClassName('fillInfo')[0].innerHTML += `
    &#x274C; Room Full <br> Room already has two player</div>
    `
    setTimeout(()=>{
        document.getElementsByClassName('fillInfo')[0].innerHTML = ``;
    },3000)
})

socket.on('start',(data)=>{
    
    playerInfo = data;
    grid = playerInfo.grid;
    roomName = playerInfo.roomName;
    
    const info = document.getElementsByClassName('loading-info')[0];

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0].innerHTML = '<div class="askForRestart>Match Started</div>'
    
    if(myTurn === true){
        info.innerHTML = `Match Started<br>Start the game, You are playing as ❌`
    }  
    
    if(myTurn === false){
        info.innerHTML = `Match Started<br>You are playing as ⭕. Waiting for ❌ to play`
    }

    setTimeout(()=>{
        restartDiv.innerHTML = ''
    },5000)
    started = true;
})

function playmove(id){
    const info = document.getElementsByClassName('loading-info')[0];
    
    if(started === false){
        info.innerHTML = `Game has not started yet !! please wait 🕐`
        return; 
    }else if(myTurn === false){
        info.innerHTML = `Opponents Chance !! please wait 🕐`
        return; 
    }

    grid = playerInfo.grid;

    let index = id.charAt(id.length - 1);
    let x_index = Math.floor(index/3);
    let y_index = (index % 3);

    if(grid[x_index][y_index] === -1){

        grid[x_index][y_index] = playerElement;
        document.getElementById(id).innerText = playerElement;
        playerElement === 'O' ? document.getElementById(id).style.color = 'white' : document.getElementById(id).style.color = 'black';
        playerElement === 'O' ? document.getElementById(id).style.backgroundColor = 'black' : document.getElementById(id).style.backgroundColor = 'white';
        playerInfo.grid = grid;
        playerInfo.moves++;
        socket.emit('playYourTurn',playerInfo);
    }
    
    info.innerHTML = `Opponents Chance !! please wait 🕐`
}

socket.on('turn', (room) =>{
    myTurn = myTurn === true ? false : true; 
    playerInfo = room;
    playChanceMusic();
    if(myTurn === true){
        const info = document.getElementsByClassName('loading-info')[0];
        info.innerHTML = `Your Turn`;
    }
    renderGrid();
})

function defaultGrid(){

    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 1;
    winnerBoard.style.opacity = 0;
    winnerBoard.innerHTML = ``;

    playerInfo.grid = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
    playerInfo.moves = 0;
    myTurn = playerElement === 'X' ? true : false;

    const info = document.getElementsByClassName('loading-info')[0];
    if(myTurn === true){
        info.innerHTML = `Your Turn`
    } else if(myTurn === false){
        info.innerHTML = `Opponents Chance! please Wait🕔`;
    }

}

function renderGrid(){
    grid = playerInfo.grid;
    for(let index = 0 ; index < 9 ; index++){
        let x_index = Math.floor(index/3);
        let y_index = (index % 3);

        let id = `block${index}`;
        if(grid[x_index][y_index] === 'X'){
            document.getElementById(id).innerText = 'X';
            document.getElementById(id).style.color = 'black';
            document.getElementById(id).style.backgroundColor = 'white';    
        } else if(grid[x_index][y_index] === 'O'){
            document.getElementById(id).innerText = 'O';
            document.getElementById(id).style.color = 'white'
            document.getElementById(id).style.backgroundColor = 'black' 
        } else {
            document.getElementById(id).innerText = '';
            document.getElementById(id).style.color = ''
            document.getElementById(id).style.backgroundColor = 'rgb(44, 196, 216)' 
        }
    }
}

socket.on('gameOver', (winningSet)=>{
    winSet = winningSet;
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    
    if(myTurn === false){
        winnerBoard.innerHTML = `You Lost`;
        lightWinningBlocks(winSet,false,playerElement);
        playLoserMusic();
    }

    if(myTurn === true){
        winnerBoard.innerHTML = `You Won`;
        lightWinningBlocks(winSet,true,playerElement);
        playVictoryMusic();
    }
    
});

function lightWinningBlocks(winSet,hasWon,element){
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    cancelTimeOut = setTimeout(()=>{
        winnerBoard.style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;

        if(hasWon === false) element = element === 'X' ? 'O' : 'X';
        
        for(let i = 0 ; i < 3 ; i++){
            let index = winSet[i];
            let id = `block${index}`;
            document.getElementById(id).style.color = 'white';
            
            if(hasWon === true){
                document.getElementById(id).style.backgroundColor = 'green';
                document.getElementById(id).innerHTML = element;
            } 
            else 
            {
                
                document.getElementById(id).innerHTML = element;
                document.getElementById(id).style.backgroundColor = 'red';
            }
        }

        document.getElementsByClassName('loading-info')[0].innerHTML = `${element} Won`
    },1500);
   
}

socket.on('draw', ()=>{
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    winnerBoard.innerHTML = `It's a Tie`;
    playTieMusic();

    setTimeout(()=>{
        winnerBoard.style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;
    },1500)
});

function reset(){
    if(cancelTimeOut !== undefined){
        clearTimeout(cancelTimeOut);
    }
    console.log("restart Called")
    if(restartFlag === true){
        return;
    }

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]
    restartDiv.innerHTML += `
    <div class="askForRestart">
    <div class="restartMessage">Restart Request Sent to Opponent.</div>
        <div class="replyLoader">
            <div>Waiting for Reply</div>
            <div class="loader"></div>
        </div>
    </div>`
    
    restartFlag = true;
    socket.emit('restart',playerInfo);
    
}

socket.on('restartRequest', function(){
    
    if(restartFlag === true){
        return;
    }
    restartFlag = true;

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]
    restartDiv.innerHTML += `
    <div class="askForRestart">
    <div class="restartMessage">Opponent wants to restart the Match <br> Continue ?</div>
            <div class="restartOptions">
                <button class="restartOptionYes">YES</button>
                <button class="restartOptionNo">NO</button>
            </div>
    </div>`
})

socket.on('restartResponse', function(restartPermission){
    
    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]

    if(restartPermission === true){
        defaultGrid();
        renderGrid();
        restartDiv.innerHTML = `
        <div class="askForRestart">
            Game Restarted
        </div>`

    } else {   
        restartDiv.innerHTML = `
        <div class="askForRestart">
            <div class="restartMessage">Opponent Denied request to restart match.</div>
        </div>`    
    }

    restartFlag = false;
    setTimeout(()=>{
        restartDiv.innerHTML = ``;
    },2000);

})

function emitDisconnectEvent() {
    socket.emit('clientDisconnect',roomName);
}
  
// Listen for the beforeunload event to notify the server
window.addEventListener('beforeunload', emitDisconnectEvent);
  
// Listen for the disconnect event to remove the beforeunload listener
socket.on('disconnect', () => {
    window.removeEventListener('beforeunload', emitDisconnectEvent);
});

socket.on('playerDisconnected',()=>{
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    winnerBoard.style.height = `40vh`;
    winnerBoard.innerHTML = `Your Opponent Disconnected!! <br> Reload to Join Another Game`;
});

function playbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 0;
    audioElement.volume = 0.2;
    audioElement.play();
};

function stopbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    audioElement.pause();
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 1;
}

function playVictoryMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['✨','🎉','💖','🎇','✨','👑','🏆','🥇','🥂','💥'],
    });
    const victoryAudioElement = document.getElementById('visctoryMusic');
    victoryAudioElement.volume = 0.4;
    victoryAudioElement.play();
}

function playLoserMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['😯','☹','🙁','📉'],
    });
    const loserAudioElement = document.getElementById('loserMusic');
    loserAudioElement.volume = 0.4;
    loserAudioElement.play();
}

function playTieMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['🤝','😐','⚔','♟'],
    });
    const tieAudioElement = document.getElementById('gameTieMusic');
    tieAudioElement.volume = 0.4;
    tieAudioElement.play();
}

function playChanceMusic(){
    stopbackgroundMusic();

    const chanceAudioElement = document.getElementById('gameChanceMusic');
    chanceAudioElement.volume = 0.4;
    chanceAudioElement.play();
}