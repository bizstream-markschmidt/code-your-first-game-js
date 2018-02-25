////////////////////////////////////////////////////////////////////////////////
// Color Constants  -- see http://www.color-hex.com/ for more options
////////////////////////////////////////////////////////////////////////////////
const baseColor    = 'white';   // foreground
const canvasColor  = '#5e871f'; // background
const ballColor    = 'white';
const netColor     = 'white';
const playerPaddleColor   = '#C9F227'; // left paddle
const computerPaddleColor = '#00F8FB'; // right paddle

////////////////////////////////////////////////////////////////////////////////
// Sound Constants  -- more here: https://freesound.org/people/NoiseCollector/packs/254/
////////////////////////////////////////////////////////////////////////////////
const paddleSound        = new Audio('sounds/bounce.mp3'); // sounds/pong.mp3
const bgMusic            = new Audio('sounds/music.mp3');
const playerScoreSound   = new Audio('sounds/score.mp3');
const computerScoreSound = new Audio('sounds/computer-score.mp3');
const winMusic           = new Audio('sounds/win.mp3');
const loseMusic          = new Audio('sounds/fail.mp3');
/*
  Options:
  - sounds/blue.mp3
  - sounds/bounce.mp3
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
const MSG_WIN             = 'Good Game, dude';
const MSG_LOSE            = 'that was kind of lame...';
const BTN_TEXT_PLAY_AGAIN = 'play again';
const FPS                 = 30; // Frames per second (animation speed)

////////////////////////////////////////////////////////////////////////////////
// Net Constants
////////////////////////////////////////////////////////////////////////////////
const NET_WIDTH        = 5;
const NET_LINE_HEIGHT  = 30;
const NET_LINE_SPACING = 60;

////////////////////////////////////////////////////////////////////////////////
// Paddle Constants
////////////////////////////////////////////////////////////////////////////////
const PADDLE_WIDTH           = 10;
const PADDLE_HEIGHT          = 100;
const PADDLE_SPACE_FROM_SIDE = 15;
const PADDLE_START_Y         = 200;

////////////////////////////////////////////////////////////////////////////////
// Ball Constants
////////////////////////////////////////////////////////////////////////////////
const BALL_START_X       = 50;
const BALL_START_Y       = 50;
const BALL_START_SPEED_X = 10;
const BALL_START_SPEED_Y = 4;
const BALL_SIZE          = 10; // Ball's diameter in pixels

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

////////////////////////////////////////////////////////////////////////////////
// Paddle Variables
////////////////////////////////////////////////////////////////////////////////
var playerPaddleY   = PADDLE_START_Y; // Paddle's starting Y position
var computerPaddleY = PADDLE_START_Y; // Paddle's starting Y position

////////////////////////////////////////////////////////////////////////////////
// Mouse Variables, I made these global so I could debug them
////////////////////////////////////////////////////////////////////////////////
var mouseX = 0;
var mouseY = 0;

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
  bgMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  bgMusic.play();

  // Restart the game when you click
  canvas.addEventListener('mousedown', handleMouseClick);

  // Make the player paddle follow the mouse
  canvas.addEventListener('mousemove', function(evt) {
    var mousePos = calculateMousePos(evt);
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
}

// Calculate where the mouse is
function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  return {
    x:mouseX,
    y:mouseY
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
    "    mouseX:"+ alignRight(mouseX.toFixed(0))     +"        mouseY:"+ alignRight(mouseY.toFixed(0)) +"\n" +
    "                 playerPaddleY:"+ alignRight(playerPaddleY.toFixed(0)) +"\n" +
    "               computerPaddleY:"+ alignRight(computerPaddleY.toFixed(0)) +"\n" +
    "</pre>";
}