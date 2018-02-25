////////////////////////////////////////////////////////////////////////////////
// Color Constants  -- see http://www.color-hex.com/ for more options
////////////////////////////////////////////////////////////////////////////////
const baseColor    = '#CF9893';   // foreground
const canvasColor  = '#3B3B58'; // background
const ballColor    = '#bc7c9ce';
const netColor     = '#BC7C9Ce';
const playerPaddleColor   = '#A96DA3'; // left paddle
const computerPaddleColor = '#7A5980'; // right paddle


////////////////////////////////////////////////////////////////////////////////
// Image Constants
////////////////////////////////////////////////////////////////////////////////
let ballImage = new Image();
ballImage.src = 'images/mya-ball.png';
////////////////////////////////////////////////////////////////////////////////
// Sound Constants  -- more here: https://freesound.org/people/NoiseCollector/packs/254/
////////////////////////////////////////////////////////////////////////////////
const paddleSound        = new Audio('sounds/smb_bump.wav'); // sounds/pong.mp3
const bgMusic            = new Audio('sounds/01-main-theme-overworld.mp3');
const playerScoreSound   = new Audio('sounds/smb_coin.wav');
const computerScoreSound = new Audio('sounds/smb_breakblock.wav');
const winMusic           = new Audio('sounds/smb_stage_clear.wav');
const loseMusic          = new Audio('sounds/smb_gameover.wav');
/*
  Options:
  - sounds/blue.mp3
  - sounds/bounce.mp3
  - sounds/pong.mp3
  - sounds/computer-score.mp3
  - sounds/fail.mp3
  - sounds/guitar.wav
  - sounds/lose.mp3
  - sounds/music.mp3
  - sounds/score.mp3
  - sounds/win.mp3
*/

////////////////////////////////////////////////////////////////////////////////
// Gameplay Constants
////////////////////////////////////////////////////////////////////////////////
const WINNING_SCORE       = 3;
const AI_DIFFICULTY       = 8; // the number of pixels the paddle moves
const MSG_WIN             = 'awesome job!';
const MSG_LOSE            = 'ha ha ha ha ha ha haboo boo boo boo boo hoohoohoohoohoohoo';
const BTN_TEXT_PLAY_AGAIN = 'play again';
const FPS                 = 30; // Frames per second (animation speed)

////////////////////////////////////////////////////////////////////////////////
// Net Constants
////////////////////////////////////////////////////////////////////////////////
const NET_WIDTH        = 9000000000000000000000000;
const NET_LINE_HEIGHT  = 30;
const NET_LINE_SPACING = 60;

////////////////////////////////////////////////////////////////////////////////
// Paddle Constants
////////////////////////////////////////////////////////////////////////////////
const PADDLE_WIDTH           = 5;
const PADDLE_HEIGHT          = 100;
const PADDLE_SPACE_FROM_SIDE = 20;
const PADDLE_START_Y         = 200;

////////////////////////////////////////////////////////////////////////////////
// Ball Constants
////////////////////////////////////////////////////////////////////////////////
const BALL_START_X       = 50;
const BALL_START_Y       = 50;
const BALL_START_SPEED_X = 12;
const BALL_START_SPEED_Y = 12;
const BALL_SIZE          = 50; // Ball's diameter in pixels

////////////////////////////////////////////////////////////////////////////////
// Set Global Variables
////////////////////////////////////////////////////////////////////////////////
var canvas;
var canvasContext;
var debug;
var playerScore   = 0;
var computerScore = 0;
var winMusicHasPlayed  = false;
var loseMusicHasPlayed = false;
var showingWinScreen   = false;
var mousePos = {x: 0, y: 0}; // used for debugging

////////////////////////////////////////////////////////////////////////////////
// Paddle Variables
////////////////////////////////////////////////////////////////////////////////
var playerPaddleY   = PADDLE_START_Y; // Paddle's starting Y position
var computerPaddleY = PADDLE_START_Y; // Paddle's starting Y position

////////////////////////////////////////////////////////////////////////////////
// Ball Variables
////////////////////////////////////////////////////////////////////////////////
var ballX = BALL_START_X; // Ball's starting X position
var ballY = BALL_START_Y; // Ball's starting Y position
var ballSpeedX = BALL_START_SPEED_X; // Ball's speed along the X axis
var ballSpeedY = BALL_START_SPEED_Y; // Ball's speed along the Y axis

////////////////////////////////////////////////////////////////////////////////
// Functions ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Run functions after the window has loaded
window.onload = function() {

  // Get the canvas element
  canvas = document.getElementById('gameCanvas');
  debug  = document.getElementById('debug');
  canvasContext = canvas.getContext('2d');
  
  // Set the FPS, initialize movement and drawing
  setInterval(function() {
    moveEverything();
    drawEverything();
  }, 1000/FPS);

  // Start music
  bgMusic.play();
  bgMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);

  // Restart the game when you click
  canvas.addEventListener('mousedown', handleMouseClick);

  // Make the player paddle follow the mouse
  canvas.addEventListener('mousemove', function(evt) {
    mousePos = calculateMousePos(evt);
    playerPaddleY = mousePos.y - (PADDLE_HEIGHT/2);
  });
}


// Handle computer AI
function moveComputerPaddle() {
  var computerPaddleYCenter = computerPaddleY + (PADDLE_HEIGHT/2);

  if (computerPaddleYCenter < ballY-35) {
    computerPaddleY += AI_DIFFICULTY;
  }
  else if (computerPaddleYCenter > ballY+35) {
    computerPaddleY -= AI_DIFFICULTY;
  }
}

// Move ball a little bit more in the same direction (ballSpeed)
function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;
}

// Animation and movement
function moveEverything() {
  if (showingWinScreen) {
    return;
  }

  moveComputerPaddle();

  moveBall();

  // Bounce or reset for the PLAYER SIDE of the screen 
  if (ballX < PADDLE_SPACE_FROM_SIDE + PADDLE_WIDTH + BALL_SIZE) {
    // Did the ball hit the PLAYER paddle?
    if (ballY > playerPaddleY && ballY < playerPaddleY+PADDLE_HEIGHT) {
      paddleSound.play();
      
      ballSpeedX++;
      ballSpeedX = -ballSpeedX;
      
      var deltaY = ballY-(playerPaddleY+PADDLE_HEIGHT/2);
      ballSpeedY++;
      ballSpeedY = deltaY * 0.35;
    }
    // Did the ball go PAST the PLAYER paddle?
    else if (ballX < 0) {
      computerScoreSound.play();
      computerScore++;
      ballReset();
    }
  }

  // Bounce or reset for the COMPUTER SIDE of the screen
  if (ballX > canvas.width - PADDLE_SPACE_FROM_SIDE - PADDLE_WIDTH - BALL_SIZE) {
    // Did the ball hit the COMPUTER paddle?
    if (ballY > computerPaddleY && ballY < computerPaddleY+PADDLE_HEIGHT) {
      paddleSound.play();

      ballSpeedX++;
      ballSpeedX = -ballSpeedX;

      var deltaY = ballY-(computerPaddleY+PADDLE_HEIGHT/2);
      ballSpeedY++;
      ballSpeedY = deltaY * 0.35;
    }
    // Did the ball go PAST the COMPUTER paddle?
    else if (ballX > canvas.width) {
      playerScoreSound.play();
      playerScore++;
      ballReset();
    }
    
  }

  // Bounce off top and bottom of screen
  if (ballY > canvas.height - BALL_SIZE || ballY < BALL_SIZE) {
    ballSpeedY = -ballSpeedY;
  }

  updateDebugInfo();
}

// Reset the ball after a score
function ballReset() {
  if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
    showingWinScreen = true;
  }

  ballSpeedX = -ballSpeedX;
  ballX = canvas.width/2;
  ballY = canvas.height/2;
}

// Draw the net
function drawNet() {
  // draw a dashed line
  for (var i = 0; i < canvas.height; i += NET_LINE_SPACING) {
    drawRect(canvas.width/2-1, i, NET_WIDTH, NET_LINE_HEIGHT, netColor);
  }
}

// Draw Win Screen
function drawWinScreen() {
  if (playerScore >= WINNING_SCORE) {
    bgMusic.pause();

    if (!winMusicHasPlayed) {
      winMusic.play();
      winMusicHasPlayed = true;
    }
    canvasContext.fillText("Player Won!",200,200);
    canvasContext.fillText(MSG_WIN,200,300);
  }
  else if (computerScore >= WINNING_SCORE) {
    bgMusic.pause();

    if (!loseMusicHasPlayed) {
      loseMusic.play();
      loseMusicHasPlayed = true;
    }
    canvasContext.fillText("Computer Won...",200,200);
    canvasContext.fillText(MSG_LOSE,200,300);
  }

  canvasContext.fillText(BTN_TEXT_PLAY_AGAIN,300,500);
}

// Draw everything
function drawEverything() {

  // Draw the playing field
  drawRect(0, 0, canvas.width, canvas.height, canvasColor);

  canvasContext.fillStyle = baseColor;

  // should we draw the winning screen?
  if (showingWinScreen) {
    drawWinScreen();
    return; // exit, do not do the rest
  }

  // Draw net
  drawNet();

  // Draw user paddle
  drawRect(PADDLE_SPACE_FROM_SIDE, playerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, playerPaddleColor);

  // Draw computer paddle 
  drawRect((canvas.width - PADDLE_WIDTH)-PADDLE_SPACE_FROM_SIDE, computerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, computerPaddleColor);
  
  // Draw ball
  drawBall(ballX, ballY, BALL_SIZE, ballColor);

  // Draw Scores
  canvasContext.font = "50px Arial";
  canvasContext.fillStyle = baseColor;
  canvasContext.fillText(playerScore, 200, 100);
  canvasContext.fillText(computerScore, canvas.width-200, 100);
}

// Function for drawing rectangles
function drawRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX,topY,width,height);
}

// Function for drawing balls
function drawBall(leftX, topY, size, drawColor) {

  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(leftX, topY, size, 0, Math.PI*2, true);
  canvasContext.fill();

  canvasContext.drawImage(ballImage, leftX - (BALL_SIZE), topY- (BALL_SIZE));
}

// Calculate where the mouse is
function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;

  return {
    x: mouseX,
    y: mouseY
  };
}

// Restart everything when you click the Play Again button
function handleMouseClick(evt) {
  if (showingWinScreen) {
    // Reset the game
    playerScore = 0;
    computerScore = 0;
    showingWinScreen = false;
    winMusicHasPlayed = false;
    loseMusicHasPlayed = false;
    ballSpeedX = BALL_START_SPEED_X;
    ballSpeedY = BALL_START_SPEED_Y;

    bgMusic.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);

    bgMusic.play();
  }
}

// update debug info
function updateDebugInfo() {
  function alignRight(val) {
    // 5 character max
    val = "     "+ val;
    return val.substr(val.length - 5);
  }

  debug.innerHTML  = "<pre>"+
    "ballSpeedX:"+ alignRight(ballSpeedX.toFixed(1)) +"    ballSpeedY:"+ alignRight(ballSpeedY.toFixed(1)) +"\n" +
    "     ballX:"+ alignRight(ballX.toFixed(0))      +"         ballY:"+ alignRight(ballY.toFixed(0)) +"\n" +
    "mousePos.x:"+ alignRight(mousePos.x.toFixed(0)) +"    mousePos.y:"+ alignRight(mousePos.y.toFixed(0)) +"\n" +
    "                 playerPaddleY:"+ alignRight(playerPaddleY.toFixed(0)) +"\n" +
    "               computerPaddleY:"+ alignRight(computerPaddleY.toFixed(0)) +"\n" +
    "</pre>";
}