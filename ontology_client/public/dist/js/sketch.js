var bg;
var last_x;
var last_y;
var system;
var socket;
  
function setup() {
  bg = loadImage("dist/img/smart_home_overview.png");
  var myCanvas = createCanvas($("#home-overview").width(), $("#home-overview").height());
  myCanvas.parent('home-overview');
  socket = io("http://localhost:1717/");
  system = new ActorSystem();  
  socket.on('foundedDevices', function(data){
		var msg = JSON.parse( data );
		$.each(msg, function( index, obj ) {
			system.addActor(createVector(obj.positionX, obj.positionY),obj.radius);
		});
	});
	socket.emit('BrowseDevices', { request: '*' });   
}

function windowResized() {
  resizeCanvas($("#home-overview").width(), $("#home-overview").height());
}

function draw() {
  background(255);
  image(bg,0,0);
  
  // Sensivity sector
  /* strokeWeight(1);
  stroke(183,28,28);
  fill(183,28,28,50);
  
  ellipse(107, 122, 200, 200);
  ellipse(104, 530, 150, 150);
  ellipse(370, 388, 100, 100);
  ellipse(370, 508, 100, 100); */

  
  system.run();
  	
  noCursor()
  strokeWeight(20.0);
  stroke(230,81,0,150); 
  // Draw Position
  if(last_x != 0 && last_y != 0){
	   ellipse(last_x, last_y, 10, 10);
  }
  
  stroke(100,150);
  ellipse(mouseX, mouseY, 10, 10);
}

function mousePressed() {
  last_x = mouseX;
  last_y = mouseY;
  
  for (var i = system.actors.length-1; i >= 0; i--) {
    var p = system.actors[i];
	var distance = Math.sqrt( Math.pow((p.position.x - last_x), 2) + Math.pow((p.position.y - last_y), 2));
    if( distance < p.radius/2){
		p.setState(2);
	}else{
		p.setState(1);
	}
  }
  
  // Update Position on server
  //$.post( "/position", { PositionX: last_x, PositionY: last_y,PositionZ:0 }); 
  socket.emit('position', { PositionX: last_x, PositionY: last_y,PositionZ:0 });
  console.log("x: " + last_x + " - y: " + last_y);
}

var Actor = function(position,radius) {
  this.position = position.copy();
  this.color = color(183,28,28,70);
  this.radius = radius;
  this.delta = 100;
  this.counter = 0;
  this.state = 1;
};

// Method to update position
Actor.prototype.setState = function(state){
	if(state == 1){
		this.color = color(183,28,28,70);
	}else if(state == 2){
		this.color = color(51,122,183,100);
	}
	this.state = state;
};

Actor.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Actor.prototype.update = function(){

};

// Method to display
Actor.prototype.display = function() {
  //stroke(183,28,28);
  //strokeWeight(1);
  
  if(this.state == 1){
	  noStroke(); 
	  fill(this.color);
	  this.counter++;
	  var r = this.radius - ((this.counter % this.delta)/10);
	  ellipse(this.position.x, this.position.y, r, r);
  }else if(this.state == 2){
	stroke(51,122,183);
	strokeWeight(2);
	fill(this.color);
	ellipse(this.position.x, this.position.y, this.radius, this.radius);
  }
};

var ActorSystem = function() {
  this.actors = [];
};

ActorSystem.prototype.addActor = function(position,radius) {
  this.actors.push(new Actor(position,radius));
};

ActorSystem.prototype.run = function() {
  for (var i = this.actors.length-1; i >= 0; i--) {
    var p = this.actors[i];
    p.run();
  }
};




