//Postavljanje canvasa i konteksta
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//Ucitavanje zvukova za razbijanje cigli i za odbijanje loptice od palicu
const brickBreakSound = new Audio('brick.mp3');
const ballBouncing = new Audio('odbijanje.mp3');

// Dimenzije kanvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Konfiguracije igre
const brickRowCount = 8;
const brickColumnCount = 18;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
//Postavljanje dimenzije loptice i palice
const paddleHeight = 10;
const paddleWidth = 1000;
const ballRadius = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

// Kreiranje i postavljanje parametara za igru
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 3;
let ballSpeedY = -3;
let gameOver = false;
let gameWon = false;

//Generiranje cigli
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let rightPressed = false;
let leftPressed = false;

//Fukcija detekciju sudara loptice s ciglama i sa palicom, gdje se u obzir uzima strana udara.
//Pri uspješnom pogotku score se povecava i igrac cuje zvuk.
//Provjerava se jeli igrac unistio sve loptice i ako je poziva se funckija za prikazivanje GAME WON
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
                let brickLeft = brick.x;
                let brickRight = brick.x + brickWidth;
                let brickTop = brick.y;
                let brickBottom = brick.y + brickHeight;

                if (
                    ballX + ballRadius > brickLeft &&
                    ballX - ballRadius < brickRight &&
                    ballY + ballRadius > brickTop &&
                    ballY - ballRadius < brickBottom
                ) {
                    let ballFromLeft = ballX - ballRadius < brickLeft;
                    let ballFromRight = ballX + ballRadius > brickRight;
                    let ballFromTop = ballY - ballRadius < brickTop;
                    let ballFromBottom = ballY + ballRadius > brickBottom;

                    if (ballFromLeft || ballFromRight) {
                        ballSpeedX = -ballSpeedX;
                    }
                    if (ballFromTop || ballFromBottom) {
                        ballSpeedY = -ballSpeedY;
                    }

                    brick.status = 0;
                    score++;

                    brickBreakSound.currentTime = 0.1;
                    brickBreakSound.play();

                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("highScore", highScore);
                    }

                    if (score === brickRowCount * brickColumnCount) {
                        gameOver = true;
                        gameWon = true;
                    }
                }
            }
        }
    }

    //Dio funkcije koji obraduje odbijanje od palicu te provjeru jeli loptica promasila palicu
    //tj jeli igra izgubljena, ako da poziva se pripadajuca funckija
    if (ballY + ballRadius > canvas.height - paddleHeight) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballBouncing.currentTime = 0.1;
            ballBouncing.play();
            ballSpeedY=-ballSpeedY
            ballSpeedX=ballSpeedX;
        } else {
            gameOver = true;
        }
    }
}

// Kontrole za upravljanje palicom
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Funkcija za crtanje lopte
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Funkcija za crtanje palice
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.shadowColor = "transparent";
}


// Funkcija za crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);

                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 5;

                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    ctx.shadowColor = "transparent";
}


// Funkcija za crtanje bodova
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
    ctx.fillText("High Score: " + highScore, canvas.width - 120, 20);
}

//Funkcija za crtanje GAME OVER
function displayGameOver() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}
//Funkcija za crtanje GAME WON
function displayGameWon() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("GAME WON", canvas.width / 2, canvas.height / 2);
}
//Funckija koja odreduje pocetni kut i brzinu lopte, s tim da se vodi racuna da pocetni kut nebi bio blizu 90 stupnjeva jer onda igra nebi bila zabavna
function setInitialBallDirection() {
    let minAngle = 30;
    let maxAngle = 150;
    let deadZoneMin = 85;
    let deadZoneMax = 95;

    let angleInDegrees;
    do {
        angleInDegrees = Math.random() * (maxAngle - minAngle) + minAngle;
    } while (angleInDegrees > deadZoneMin && angleInDegrees < deadZoneMax);

    let angleInRadians = angleInDegrees * (Math.PI / 180);

    let initialSpeed = 6;
    ballSpeedX = initialSpeed * Math.cos(angleInRadians);
    ballSpeedY = -initialSpeed * Math.sin(angleInRadians);
}

// Glavna petlja igre
function draw() {
    //na pocetku se sve ocisti
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //provjerava se jeli igra gotova, na jedan od dva nacina
    if (gameOver) {
        if (gameWon) {
            displayGameWon();
        } else {
            displayGameOver();
        }
        return;
    }

    //ukoliko nije, crtaju se cigle, loptica, palica, rezultat i nastavlja se sa detekcijom sudara
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Logika za odbijanje lopte od stranice canvasa tj ekrana
    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY;
        } else {
            gameOver = true;
        }
    }

    // Pomicanje lopte i palice
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    //ponavaljnje animacije pri 60FPS
    requestAnimationFrame(draw);
}

// Funkcija za prilagodbu veličine canvasa, najvise koristena pri debuggiranju
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
}

// Pokretanje funkciju resizeCanvas jednom na početku
resizeCanvas();

//postavljanje event listenera za mijenjanje velicina prozora te za pritisak tipki
window.addEventListener('resize', resizeCanvas);
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Pokretanje igre
// Postavite početni smjer lopte prilikom pokretanja igre
setInitialBallDirection();
draw();

