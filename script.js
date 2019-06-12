let canvas= document.getElementById("game");
let ctx=canvas.getContext("2d");


let bgm = new sound("bgm.mp3");
bgm.loop=true;
let gameover= new sound("gameover.mp3");
gameover.loop=false;
let shot=new sound("shoot.mp3");
shot.loop=false;
canvas.setAttribute('width' , "1500px");
canvas.setAttribute('height' , "900px");
let leaderboard=document.getElementById('leaderboard');
var cannonX, right, left, players, namebuffer, max_num;
let bullets,tBullet, balls, flag, score, ballInterval, bulletInterval;
players=[];
namebuffer="";
function ini(){
	players.sort(function(a,b){ return b.score-a.score });
	bgm.play();
	max_num=12;
	cannonX = canvas.width/2 - 50;	
	right = false;	
	left = false;
	bullets=[];
	balls=[];
	score=0;
	tBullet=80;
	tBall=4000;
	function repeat(){
		drawBullets();
		bulletInterval = setTimeout(repeat , tBullet);
	}
	repeat();
	function repeat2(){
		drawBalls();
		ballInterval=setTimeout(repeat2, tBall);
	}
	repeat2();
	flag=0;

}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}





document.addEventListener('keydown' , function(e){

	if(e.key=="ArrowLeft"||e.key=="Left")
		 left=true; 
	if(e.key=="ArrowRight" || e.key =="Right" )
		 right=true; 
}, false);

document.addEventListener('keyup' , function(e){
	if(e.key=="ArrowLeft" || e.key=="Left")
		left=false;
	if(e.key=="ArrowRight" || e.key=="Right")
		right=false;
}, false);



function drawCannon(){
	ctx.fillStyle = 'rgb(255 , 0 , 0)';
	ctx.fillRect(cannonX , canvas.height - 50  , 100 , 50);
}

function createBullet( x , y){
	return{
		x: x ,
		y: y, 
		draw: function(){
			ctx.fillStyle="#FFFFFF";
			ctx.beginPath();
			ctx.arc(this.x , this.y , 8 , 0 , 2*Math.PI , true);
			ctx.fill();
			}
	};
}

function drawBullets(){
	clearTimeout(bulletInterval);
	bullets.push(createBullet(cannonX+50 , canvas.height-60 )); 	
}


function createBall(x, y , num , dir){
	return{
		speed: -8,
		sp:4,
		a: 0.3,
		x: x,
		y: y, 
		ini: num,
		num: num,
		dir:  dir, 
		draw: function(){
			ctx.fillStyle='rgb(0, 0 , 255)';
			ctx.beginPath();
			ctx.arc(this.x, this.y , 50 , 0 , 2*Math.PI , true);
			ctx.fill();
			ctx.fillStyle="#FFFFFF";
			ctx.font="30px serif";
			ctx.fillText(this.num , this.x , this.y);
			}
		};
}


function drawBalls(){
	let num = parseInt(Math.random()*max_num + 1);
	let f= Math.random();
	if(f<0.5)
		balls.push(createBall(-50 , 100 , num, true));	
	else
		balls.push(createBall(canvas.width+50 , 100 , num , false));
}



function cannonTouch(obj){
	if(obj.x > (cannonX-(50/Math.sqrt(2))) && obj.x< (cannonX+100+(50/Math.sqrt(2))) && obj.y >=(canvas.height - 100))
		flag=-1; 		
}		
	
function displayScore(){
	ctx.font="25px serif";
	ctx.fillStyle='rgb(0,255,0)';
	ctx.fillText("Score: "+score , 80 , 50);
	ctx.fillStyle='#ff3300';
	ctx.fillText("HighScore: "+players[0].score ,canvas.width-150 , 50);
	if(players[0].score<score)
		players.sort(function(a,b){ return b.score-a.score });
}

function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	if((right)&&((cannonX+100)<canvas.width))
		cannonX+=10;
	if((left)&&(cannonX>0))
		cannonX-=10;

	bullets.forEach(function(obj){
			obj.y = obj.y - 11;
			obj.draw();
			
	});

	for(j=0;j<balls.length;j++){
		let obj=balls[j];
		if(balls[j].dir)
			obj.sp=4;
		else 
			obj.sp=-4;
		obj.x+=obj.sp;
		obj.y+=obj.speed;
		obj.speed+=obj.a;
		obj.draw();
		if(obj.y+50 >= canvas.height)
			obj.speed=-obj.speed;

		if(obj.x-50< 0 && obj.sp<0)
			obj.dir=true;
		if((obj.x + 50 > canvas.width) && (obj.sp>0))
			obj.dir=false;
		if(obj.y-50<0 && obj.speed <0)
			obj.speed = -obj.speed;
		cannonTouch(obj);
		if(obj.num===0)
			balls.splice(j,1);
		for(i=0;i<bullets.length;i++){
			if(bullets[i].y<0)
				bullets.splice(i,1);
			else if(Math.sqrt(Math.pow((obj.x-bullets[i].x),2)+Math.pow((obj.y-bullets[i].y),2)) < 58){
				bullets.splice(i,1);
				obj.num-=1;
				score++;
				if(score%20===0){
					tBall=tBall+400;
					tBullet=tBullet-1;
				}
				if(score%40===0)
					max_num+=12
				if(obj.num===0){
					shot.play();
					balls.push(createBall(obj.x , obj.y , parseInt(obj.ini/2) , false));
					balls.push(createBall(obj.x, obj.y, parseInt(obj.ini/2), true));	
					balls.splice(j,1);
				}	
			}
		}
	
	}
			
	for(i=leaderboard.childElementCount-1; i>=0;i--)
		if(leaderboard.childNodes[i].score <=score)
			leaderboard.insertBefore(reqObj.li , leaderboard.childNodes[i]);	
	reqObj.display(score);
	displayScore();
	drawCannon();	

	if(flag==-1)
			endgame();
	else
	requestAnimationFrame(draw);
}

function endgame(){
	bgm.stop();
	gameover.play();
	if(score>pobj.score)
		pobj.score=score;
	window.localStorage.setItem('players' , JSON.stringify(players));
	alert("game over");
	clearInterval(bulletInterval);
	clearInterval(ballInterval);
	namebuffer="";
	Info();
}

function createPlayer(nam, scor){
	return{
		name: nam, 
		score: scor,
		li: document.createElement("li"),
		add: function(){
		        	leaderboard.appendChild(this.li);
				this.li.setAttribute('class' , "list");
		},
		display: function(num){
			this.score = num;
			this.li.innerHTML = this.name+":     "+this.score;
			this.li.score=this.score;
		}
			 			
	};
}

let reqObj;

function Start(){
	ini();
	players.forEach(function(obj){
		if(obj.name===namebuffer)
			reqObj=obj;
	});
	draw();
}

function Info(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle='#000000';
	ctx.fillRect(0,0,canvas.width, canvas.height);
	ctx.textAlign='center';
	ctx.font='40px serif';
	ctx.fillStyle='#FFFFFF';
	ctx.fillText("Enter player name: ", canvas.width/2, canvas.height/2-100);
	ctx.fillText(namebuffer, canvas.width/2, canvas.height/2+100);	
}
let pobj;
document.addEventListener('keypress' , function(e){
	e.preventDefault();
	code=parseInt(e.which);
	if(code==13){	
		pobj=createPlayer(namebuffer, 0)	
		players.push(pobj);
		pobj.add();
		Start();
	}
	else
	{ namebuffer=namebuffer+String.fromCharCode(code);
	 Info();
	 ctx.fillText("Press enter to continue", canvas.width/2, canvas.height-100);} 
	});
		
	

Info();


window.addEventListener('load' , extract);
function extract(){
	players=JSON.parse(window.localStorage.getItem('players'));
	if(!players)
		players=[];
	else{
		players.sort(function(a,b){ return b.score-a.score });
		players.forEach(function(obj){
			displayList(obj.name, obj.score);
		});
	}		
}

function displayList(name, score)
{
	let li = document.createElement('li');
	li.innerHTML =name+":     "+score;
	leaderboard.appendChild(li);
        li.setAttribute('class' , "list");
	li.score=score;
}


	
