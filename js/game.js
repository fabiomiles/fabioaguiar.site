var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;
//document.body.appendChild(canvas);

var gravity = 1000;
var jumpSpeed = 300;

var HORIZONTAL = 0;
var VERTICAL = 1;
var RIGHT = 0;
var LEFT = 1;


var seaLevel = canvas.height * 0.8;
// Background image
/*var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";*/

var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

var hero = {
	speed: 200, // movement in pixels per second
	jumpSpeed: 0,
	x: 10,
	y: canvas.height/2 - 32,
	isJumping: false,
	height: 32,
	width: 32
};

function Obstacle(x, y, width, height, speed)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.jumpSpeed = 0;
}

function Bubble(target, width, height, text, triggerObstacle)
{
	this.target = target;
	this.width = width;
	this.height = height;
	this.text = text;
	this.triggerObstacle = triggerObstacle;
}


var level = [[0, 0], [200, 0], [200, 30], [230, 30], [230, -30], [310, -30], [310, 0], [canvas.width, 0]];

var riseLevelToSeaLevel = function(level)
{
	for(var i = 0; i < level.length; i++)
	{
		level[i][1] = seaLevel - level[i][1];
		console.log("(%i, %i)", level[i][0], level[i][1]);
	}
}

riseLevelToSeaLevel(level);

var ob1 = new Obstacle(400, canvas.height/2, 20, 20, 0);
var ob2 = new Obstacle(600, canvas.height/2, 20, 20, 0);

var tempObjects = [hero, ob1, ob2];

var bub1 = new Bubble(hero, 60, 40, "some text 1", ob1);
var bub2 = new Bubble(hero, 60, 40, "some text 2", ob2);

var bubbles = [bub1, bub2];

var drawObjects = function()
{
	for(var i = 1; i < tempObjects.length;i++)
	{
		//ctx.fillStyle = "black";
		ctx.fillRect(tempObjects[i].x, tempObjects[i].y, tempObjects[i].width, tempObjects[i].height);
	}
}

var heightUnder = function(obstacle)
{
	var maxHeight = canvas.height;
	for(var i = 0; i < level.length - 1; i++)
	{
		if((obstacle.x >= level[i][0] && obstacle.x <= level[i+1][0]) ||
			(obstacle.x + obstacle.width >= level[i][0] && obstacle.x + obstacle.width <= level[i+1][0]) ||
			(obstacle.x <= level[i][0] && obstacle.x + obstacle.width >= level[i+1][0]))
		{
			maxHeight = Math.min(maxHeight, level[i][1],level[i+1][1]);
		}
	}
	//console.log("heightUnderHero = %i", canvas.height - maxHeight);
	return  maxHeight - obstacle.height;
}

function drawBubble(bubble)
{
	radius = 5;

	tempY = bubble.target.y - bubble.height - 2*radius;
	tempX = bubble.target.x + bubble.target.width/2;

	ctx.beginPath();
	ctx.strokeStyle="black";
  	ctx.lineWidth="2";
  	ctx.moveTo(tempX + radius, tempY);
  	ctx.lineTo(tempX + bubble.width - radius, tempY);
  	ctx.quadraticCurveTo(tempX + bubble.width, tempY, tempX + bubble.width, tempY + radius);
  	ctx.lineTo(tempX + bubble.width, tempY + bubble.height - radius);
  	ctx.quadraticCurveTo(tempX + bubble.width, tempY + bubble.height, tempX + bubble.width - radius, tempY + bubble.height);
  	ctx.lineTo(tempX + 2*radius, tempY + bubble.height);
  	ctx.lineTo(tempX, tempY + bubble.height + radius);
  	ctx.lineTo(tempX + radius, tempY + bubble.height);
  	ctx.quadraticCurveTo(tempX, tempY + bubble.height, tempX, tempY + bubble.height - radius);
  	ctx.lineTo(tempX, tempY + radius);
  	ctx.quadraticCurveTo(tempX, tempY, tempX + radius, tempY);
  	ctx.stroke();

  	ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    //ctx.fillStyle = 'blue';
    ctx.fillText(bubble.text, tempX + (bubble.width / 2), bubble.target.y - (bubble.height / 2) - radius)

}

var horizontalCollision = function()
{
	for(var i = 0; i < level.length - 1; i++)
	{
		//console.log("Hero(%i, %i), level(%i, %i), level+1(%i, %i)", hero.x, hero.y, level[i][0], level[i][1], level[i+1][0], level[i+1][1]);
		if(level[i][0] == level[i+1][0] && level[i][0] > hero.x && level[i][0] < (hero.x + heroImage.width) && level[i][1] != level[i+1][1] && 
			Math.min(level[i][1], level[i+1][1]) < (hero.y + hero.height) && Math.max(level[i][1], level[i+1][1]) > hero.y)
		{
			//right or left
			if(level[i][0] < hero.x + heroImage.width/2)
				return LEFT;
			else
				return RIGHT;
		}
	}
	//console.log("no collision");
	return -1;
}

var heroInBubbleTrigger = function(bubble)
{
	//console.log("Bubble triger Y = %i", bubble.triggerObstacle.y);
	if((hero.x > bubble.triggerObstacle.x + bubble.triggerObstacle.width ||
		bubble.triggerObstacle.x > hero.x + hero.width) ||
		(hero.y > bubble.triggerObstacle.y + bubble.triggerObstacle.height ||
		bubble.triggerObstacle.y > hero.y + hero.height))
	{
		//console.log("Not in bubble trigger");
		return false;
	}
	else
	{
		//console.log("In bubble trigger");
		return true;
	}
}

// Handle keyboard controls
/*var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);*/

var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// Update game objects
var update = function (modifier) {

	if (Key.isDown(Key.UP) && !hero.isJumping)
	{ // Player holding up
		hero.jumpSpeed = jumpSpeed;
		//hero.jumpStart = Date.now();
		//console.log("Jump started");
		hero.isJumping = true;
	}

	//console.log("%i", hero.y);

	for(var i = 0; i < tempObjects.length; i++)
	{
		//console.log("Object index: %i, x: %i y: %i", i, tempObjects[i].x, tempObjects[i].y);
		//console.log("i: %i, y: %y, height under: %i", i, tempObjects[i].y, heightUnder(tempObjects[i]));
		if(tempObjects[i].y <= heightUnder(tempObjects[i]))
		{
			//console.log("i dentro do if: %i", i);
			//console.log("Object index: %i, x: %i y: %i", i, tempObjects[i].x, tempObjects[i].y);
			tempObjects[i].y -= tempObjects[i].jumpSpeed*modifier;
			tempObjects[i].jumpSpeed -= gravity*modifier;


			if(tempObjects[i].y > heightUnder(tempObjects[i])) //has landed
			{
				tempObjects[i].jumpSpeed = 0;
				tempObjects[i].y = heightUnder(tempObjects[i]);
				tempObjects[i].isJumping = false; //only work for hero
			}
		}

	}

	if (Key.isDown(Key.DOWN)) { // Player holding down
		//hero.y += hero.speed * modifier;
	}
	if (Key.isDown(Key.LEFT)) { // Player holding left
		hero.x -= hero.speed * modifier;
		if(horizontalCollision() == LEFT || hero.x < 0)
		{
			hero.x += hero.speed * modifier;
		}
	}
	if (Key.isDown(Key.RIGHT)) { // Player holding right
		hero.x += hero.speed * modifier;
		if(horizontalCollision() == RIGHT || hero.x + heroImage.width > canvas.width)
		{
			hero.x -= hero.speed * modifier;
		}
	}
};

var render = function () {
	/*if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}*/

	ctx.clearRect ( 0 , 0 , canvas.width , canvas.height );

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	ctx.fillStyle = "rgb(0, 0, 0)";

	ctx.beginPath();
	//ctx.moveTo(level[0][0],level[0][1] + canvas.height/2 + heroImage.height);
	for(var i=0; i < level.length; i++)
	{
		ctx.lineTo(level[i][0], level[i][1]);
	}
	//ctx.lineTo(512,canvas.height/2 + heroImage.height);
	ctx.stroke();

	drawObjects();

	for(var i = 0; i < bubbles.length; i++)
	{
		if(heroInBubbleTrigger(bubbles[i]))
		{
			drawBubble(bubbles[i]);
		}
	}


	// Score
	/*ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);*/
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta /1000);
	render();

	then = now;
};

// Let's play this game!
//reset();
var then = Date.now();
setInterval(main, (1000/60)); // Execute as fast as possible