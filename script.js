// Definicije canvas objekta i konteksta
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimenzije kanvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Konfiguracije igre
const brickRowCount = 8; // Broj redova cigli
const brickColumnCount = 18; // Broj stupaca cigli
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const paddleHeight = 10;
const paddleWidth = 200;
const ballRadius = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

// Kreiranje objekata za igru
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 2;
let ballSpeedY = -2;
let gameOver = false;
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = cigla postoji
    }
}

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let rightPressed = false;
let leftPressed = false;

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
                // Koordinate cigle
                let brickLeft = brick.x;
                let brickRight = brick.x + brickWidth;
                let brickTop = brick.y;
                let brickBottom = brick.y + brickHeight;

                // Provjera sudara s lopte uzimajući u obzir radijus
                if (
                    ballX + ballRadius > brickLeft &&
                    ballX - ballRadius < brickRight &&
                    ballY + ballRadius > brickTop &&
                    ballY - ballRadius < brickBottom
                ) {
                    // Detekcija stranice sudara
                    let ballFromLeft = ballX - ballRadius < brickLeft;
                    let ballFromRight = ballX + ballRadius > brickRight;
                    let ballFromTop = ballY - ballRadius < brickTop;
                    let ballFromBottom = ballY + ballRadius > brickBottom;

                    // Promijeni smjer brzine ovisno o strani sudara
                    if (ballFromLeft || ballFromRight) {
                        ballSpeedX = -ballSpeedX; // Sudar s lijeve ili desne strane cigle
                    }
                    if (ballFromTop || ballFromBottom) {
                        ballSpeedY = -ballSpeedY; // Sudar s gornje ili donje strane cigle
                    }

                    // Deaktiviraj ciglu i povećaj rezultat
                    brick.status = 0;
                    score++;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("highScore", highScore);
                    }
                    if (score === brickRowCount * brickColumnCount) {
                        alert("Čestitamo! Pobijedili ste!");
                        document.location.reload();
                    }
                }
            }
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

    // Apply shadow properties
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Shadow color (black with some transparency)
    ctx.shadowBlur = 10; // Shadow blur intensity
    ctx.shadowOffsetX = 0; // Shadow horizontal offset
    ctx.shadowOffsetY = 5; // Shadow vertical offset

    ctx.fillStyle = "red"; // Paddle color
    ctx.fill();
    ctx.closePath();

    // Reset shadow for other elements
    ctx.shadowColor = "transparent"; // Reset shadow after drawing the paddle
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

                // Apply shadow properties
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Shadow color (black with some transparency)
                ctx.shadowBlur = 5; // Shadow blur intensity
                ctx.shadowOffsetX = 0; // Shadow horizontal offset
                ctx.shadowOffsetY = 5; // Shadow vertical offset

                ctx.fillStyle = "#0095DD"; // Brick color
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    // Reset shadow for other elements
    ctx.shadowColor = "transparent"; // Reset shadow after drawing bricks
}


// Funkcija za crtanje bodova
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
    ctx.fillText("High Score: " + highScore, canvas.width - 120, 20);
}

// Glavna funkcija za crtanje igre
function displayGameOver() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

function setInitialBallDirection() {
    let minAngle = 30; // Minimalni kut (prema gore lijevo)
    let maxAngle = 150; // Maksimalni kut (prema gore desno)

    // Generiraj slučajni kut u stupnjevima između minAngle i maxAngle
    let angleInDegrees = Math.random() * (maxAngle - minAngle) + minAngle;

    // Pretvori kut u radijane
    let angleInRadians = angleInDegrees * (Math.PI / 180);

    // Postavi početne komponente brzine lopte
    let initialSpeed = 5; // Početna brzina lopte
    ballSpeedX = initialSpeed * Math.cos(angleInRadians);
    ballSpeedY = -initialSpeed * Math.sin(angleInRadians); // Negativna vrijednost jer ide prema gore
}

// Glavna funkcija za crtanje igre
function draw() {
    // Očistite canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Provjerite je li igra gotova
    if (gameOver) {
        displayGameOver();
        return; // Prekinite izvođenje ostatka koda u draw() funkciji
    }

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Logika za odbijanje lopte
    // Kolizija s rubovima
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

    requestAnimationFrame(draw);
}

// Funkcija za prilagodbu veličine kanvasa
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ažurirajte pozicije elemenata koji ovise o veličini kanvasa
    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
}

// Pokreni funkciju resizeCanvas jednom na početku
resizeCanvas();

// Poveži funkciju resizeCanvas s događajem promjene veličine prozora
window.addEventListener('resize', resizeCanvas);

// Ostatak koda ostaje isti

// Event listeneri za kontrolu igre
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Pokretanje igre
// Postavite početni smjer lopte prilikom pokretanja igre
setInitialBallDirection();
draw();

