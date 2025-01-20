        // Selecting the elements from html
        const container = document.querySelector('.container'); // Using a . for getting the container class
        const ball = document.querySelector('#ball'); // Using a # to get the id
        const paddle = document.querySelector('.paddle');
        const btn_start = document.querySelector('.startBtn');

        //Game Setting variables
        const numBricks = 12;
        const amountStartLives = 5;
        const paddleSpeed = 10;

        // Default Variables
        let gameOver = true;
        let gameInPlay = false;
        let score = 0;
        let lives = amountStartLives;
        let animationRepeat;
        let ballDir = [5,5,5];
        let containerDim = container.getBoundingClientRect();
        //console.log(containerDim);


        // Controls
        btn_start.addEventListener('click', startGame);
        document.addEventListener('keydown',function(e){
            let key = e.keyCode;
            e.preventDefault();
            if(key===37) paddle.left = true;
            else if (key===39) paddle.right = true;
            else if (key===38 && !gameInPlay) gameInPlay = true;
            //console.log(key);

        });
        document.addEventListener('keyup', function(e){
            let key = e.keyCode;
            e.preventDefault();
            if(key===37) paddle.left = false;
            else if (key===39) paddle.right = false;
            //console.log(key);
        });

        function startGame(){
            if(gameOver){
            document.querySelector('.gameover').style.display = 'none';
            document.querySelector('.startBtn').style.display = 'none';
            ball.style.display = 'block';
            lives = amountStartLives; // this needs to be set back to 5 everytime the start game button is pressed
            setupBricks(numBricks);
            lifeUpdater();
            animationRepeat = requestAnimationFrame(update)
            gameOver = false;
            gameInPlay = false;
            //console.log(paddle);
            //console.dir(paddle); // dir gives all the info of the paddle div
            }
        }   

        function setupBricks(num){
            let row = {x:((containerDim.width % 100)/2),y:50};
            for(let x = 0; x < num; x++){
                if(row.x > (containerDim.width - 100)){
                    row.y += 70;
                    row.x = ((containerDim.width % 100)/2)
                }
                brickMaker(row);
                row.x += 100;
            }
        }

        function brickMaker(row){
            let div = document.createElement('div');
            div.setAttribute('class','brick')
            //div.style.backgroundColor = ranColor();
            div.style.background = 'Linear-gradient(' +  ranColor() + ',' + ranColor() + ')';
            let pointDiv = Math.ceil(Math.random() * 10) +2;
            div.dataset.points = pointDiv;
            div.innerHTML = pointDiv;
            div.style.left = row.x + 'px';
            div.style.top = row.y + 'px';
            container.appendChild(div);
        }

        function ranColor(){
            function c(){
                let hex = Math.floor(Math.random() * 256).toString(16); // toString 16 because we want it to be returned in hex
                let response=('0' + String(hex)).substr(-2);// makes sure it returns 2 chars
                return response;
            }
            return '#' + c() + c() + c();
        }

        function update(){
            if(gameOver===false){
                let pCurrent = paddle.offsetLeft;
                if(paddle.left && pCurrent > 0 ){
                    pCurrent -= paddleSpeed;
                } else if(paddle.right && pCurrent < (containerDim.width - paddle.offsetWidth)){
                    pCurrent += paddleSpeed;
                }
                paddle.style.left = pCurrent + 'px';
                if(!gameInPlay){
                    waitingOnPaddle();
                }else{
                    ballMove();
                }
                animationRepeat = requestAnimationFrame(update); // Animation loop
                //console.log(pCurrent);
            }
        }

        function waitingOnPaddle(){
            ball.style.top = (paddle.offsetTop - 22) + 'px';
            ball.style.left = (paddle.offsetLeft + 70) + 'px';
        }

        function ballMove(){
            let x = ball.offsetLeft;
            let y = ball.offsetTop;

            if(x > (containerDim.width - ball.offsetWidth) || x < 0 ){
                ballDir[0] *= -1; // *-1 will change the direction
            }
            if( y > (containerDim.height - ball.offsetHeight) || y < 0){
                if( y > (containerDim.height - ball.offsetHeight)){
                    fallOffEdge();
                    return;
                }
                ballDir[1] *= -1;
            }

            if(isCollide(ball,paddle)){
                //console.log('HIT');
                let nDir = ((x - paddle.offsetLeft) - (paddle.offsetWidth / 2 )) / 10;
                //console.log(nDir);
                ballDir[0] = nDir;
                ballDir[1] *= -1;
            }
            
            let tempBricks = document.querySelectorAll('.brick');
            if(tempBricks.length == 0){
                stopper();
                setupBricks(numBricks * 2 );
            }
            for (let tarBrick of tempBricks){
                if(isCollide(tarBrick,ball)){
                    ballDir[1] *=-1;
                    tarBrick.parentNode.removeChild(tarBrick);
                    scoreUpdate(tarBrick.dataset.points);
                }
            }

            x += ballDir[0];
            y += ballDir[1];

            ball.style.top = y + 'px';
            ball.style.left = x + 'px';
        }

        function isCollide(a,b){
            let aRect = a.getBoundingClientRect();
            let bRect = b.getBoundingClientRect();
            //console.log(aRect)
            //console.log(bRect)
            //console.log(!(aRect.bottom < bRect.top || aRect.top > bRect.bottom || aRect.right < bRect.left || aRect.left > bRect.right));
            return !(aRect.bottom < bRect.top || aRect.top > bRect.bottom || aRect.right < bRect.left || aRect.left > bRect.right)

        }

        function lifeUpdater(){
            document.querySelector('.lives').innerText = lives;
        }

        function scoreUpdate(num){
            score += parseInt(num);
            document.querySelector('.score').innerText = score;
        }
        
        function stopper(){
            gameInPlay = false;
            ballDir[0,-5];
            waitingOnPaddle();
            window.cancelAnimationFrame(animationRepeat);
        }

        function EndGame(){
            document.querySelector('.gameover').style.display = 'block';
            document.querySelector('.gameover').innerHTML = 'GAME OVER <br> Your Score: '+score;
            document.querySelector('.startBtn').style.display = 'inline-block';
            gameOver = true;
            ball.style.display = 'none';
            let tempBricks = document.querySelectorAll('.brick');
            for (let tarBrick of tempBricks){
                ballDir[1] *=-1;
                tarBrick.parentNode.removeChild(tarBrick);
            }
        }

        function fallOffEdge(){
            lives--;
            if(lives < 0){
                EndGame();
                lives = 0;
            }
            lifeUpdater();
            stopper();
        }