let game = {
    canvas: null,
    ctx: null,
    player: {
        x: 300,
        y: 700,
        radius: 15,
        velocityY: 0,
        color: '#FFC857'
    },
    platforms: [],
    score: 0,
    gravity: 0.5,
    isRunning: false,
    camera: {
        y: 0
    },
    colors: {
        background: '#2E4057',
        platform: '#7CA5B8',
        borders: '#C1666B'
    }
};

function initGame() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Lägg till mushändelse
    game.canvas.addEventListener('mousemove', (e) => {
        const rect = game.canvas.getBoundingClientRect();
        game.player.x = e.clientX - rect.left;
    });
    
    // Skapa startplattformar
    createInitialPlatforms();
}

function createInitialPlatforms() {
    // Startplattform
    game.platforms.push({
        x: 250,
        y: 750,
        width: 100,
        height: 20
    });
    
    // Skapa några till plattformar
    for (let i = 0; i < 5; i++) {
        createPlatform();
    }
}

function createPlatform() {
    const lastPlatform = game.platforms[game.platforms.length - 1];
    const minY = lastPlatform ? lastPlatform.y - 200 : game.canvas.height;
    const maxY = lastPlatform ? lastPlatform.y - 100 : game.canvas.height;
    
    game.platforms.push({
        x: Math.random() * (game.canvas.width - 60),
        y: Math.random() * (maxY - minY) + minY,
        width: 60,
        height: 20
    });
}

function updateGame() {
    if (!game.isRunning) return;

    // Uppdatera spelarposition
    game.player.velocityY += game.gravity;
    game.player.y += game.player.velocityY;

    // Uppdatera kameraposition för att följa spelaren
    if (game.player.y < game.canvas.height / 2) {
        const diff = game.canvas.height / 2 - game.player.y;
        game.camera.y += diff;
        game.player.y += diff;
        
        // Flytta alla plattformar ner
        for (let platform of game.platforms) {
            platform.y += diff;
        }

        // Ta bort plattformar som är utanför skärmen och skapa nya
        game.platforms = game.platforms.filter(p => p.y < game.canvas.height);
        while (game.platforms.length < 6) {
            createPlatform();
        }
    }

    // Kontrollera plattformskollisioner
    for (let platform of game.platforms) {
        if (game.player.velocityY > 0 && // Faller nedåt
            game.player.x > platform.x - game.player.radius &&
            game.player.x < platform.x + platform.width + game.player.radius &&
            game.player.y > platform.y - game.player.radius &&
            game.player.y < platform.y + platform.height) {
            
            game.player.y = platform.y - game.player.radius;
            game.player.velocityY = -15; // Hoppa upp
        }
    }

    // Game over om spelaren faller under skärmen
    if (game.player.y > game.canvas.height) {
        gameOver();
        return;
    }

    // Uppdatera poäng baserat på kameraposition
    game.score = Math.floor(game.camera.y / 10);
    document.getElementById('score-display').textContent = `Score: ${game.score}`;

    // Rita om spelet
    drawGame();
    requestAnimationFrame(updateGame);
}

function drawGame() {
    // Rensa canvas
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

    // Rita bakgrund med gradient
    const gradient = game.ctx.createLinearGradient(0, 0, 0, game.canvas.height);
    gradient.addColorStop(0, '#1B2845'); // Mörkare blå topp
    gradient.addColorStop(1, '#2E4057'); // Ljusare blå botten
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // Rita plattformar med skugga och kant
    for (let platform of game.platforms) {
        // Skugga
        game.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        game.ctx.shadowBlur = 5;
        game.ctx.shadowOffsetY = 3;

        // Plattformens huvuddel
        game.ctx.fillStyle = game.colors.platform;
        game.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Kant på plattformen
        game.ctx.strokeStyle = game.colors.borders;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

        // Återställ skugga
        game.ctx.shadowColor = 'transparent';
    }

    // Rita spelaren med glöd-effekt
    game.ctx.beginPath();
    
    // Yttre glöd
    game.ctx.shadowColor = '#FFC857';
    game.ctx.shadowBlur = 15;
    game.ctx.shadowOffsetY = 0;
    
    // Spelaren
    game.ctx.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2);
    game.ctx.fillStyle = game.player.color;
    game.ctx.fill();
    
    // Inre detalj
    game.ctx.beginPath();
    game.ctx.arc(game.player.x, game.player.y, game.player.radius * 0.7, 0, Math.PI * 2);
    game.ctx.fillStyle = '#FFE2AB'; // Ljusare gul för inre cirkel
    game.ctx.fill();
    
    game.ctx.closePath();
    
    // Återställ skugga
    game.ctx.shadowColor = 'transparent';
}

function startGame() {
    // Dölj start- och game over-skärmar
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    
    // Återställ spelläge
    game.player.x = 300;
    game.player.y = 700;
    game.player.velocityY = 0;
    game.platforms = [];
    game.score = 0;
    game.isRunning = true;
    
    createInitialPlatforms();
    updateGame();
}

function gameOver() {
    game.isRunning = false;
    document.getElementById('game-over-screen').style.display = 'flex';
    document.getElementById('final-score').textContent = `Score: ${game.score}`;
}

// Initiera spelet när sidan laddas
window.onload = initGame;
