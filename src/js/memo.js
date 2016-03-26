/*
    Capture hands
*/
var pointX;
var pointY;
var pointZ;
var graph = new Array(3);
for (var i=0; i<graph.length; i++){
    graph[i] = new Array();
}
var saveFlag = false;
var newFlag = false;
var loadFlag = false;
//var swipeDirection = "";

function captureLeapmotion(){
    var controller = new Leap.Controller();
    // get position of tip
    controller.on('connect', function(){
        setInterval(function(){
            var frame = controller.frame();
            if (frame.pointables.length >0){
                tipPos2Array(frame.pointables[1].tipPosition);
            }
        }, 16); // about 60FPS
    });
    // get gesture
    controller.on("gesture", function(gesture){
        if(gesture.type == "swipe") {
          var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
          if(isHorizontal){
              if(gesture.direction[0] > 0){
                  //swipeDirection = "right";
                  newFlag = true;
              } else {
                  //swipeDirection = "left";
              }
          } else { //vertical
              if(gesture.direction[1] > 0){
                  //swipeDirection = "up";
                  saveFlag = true;
              } else {
                  //swipeDirection = "down";
                  loadFlag = true;
              }
          }
          //console.log(swipeDirection)
       }
    });
    controller.connect();
}

function tipPos2Array(vector, digits) {
    if (typeof digits === "undefined") {
    digits = 1;
    }
    pointX = 720 + 3.5 * vector[0].toFixed(digits);
    pointY = 1200 - 3.5 * vector[1].toFixed(digits);
    pointZ = -20 - 0.5 * vector[2].toFixed(digits);
}

/*
    Draw image with P5.js
*/
var pointer;
var lines;
    
function setup() {
    createCanvas(1420, 780);
    pointer = new ball(20);
    lines = new handWriting();
    captureLeapmotion();
}

function draw() {
    background(255);
    pointer.move();
    pointer.display();
    lines.update();
    lines.display();
    
    if(saveFlag){
        saveFlag = false;
        saveFile();
    } else if (loadFlag){
        loadFlag = false;
        clearFile();
        loadFile();
    }
    if (newFlag) {
        newFlag = false;
        clearFile();
    }
}

function ball(tempDiameter){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.diameter = tempDiameter;
    
    this.move = function(){
        this.x = pointX;
        this.y = pointY;
        this.z = pointZ;
    }
    
    this.display = function(){
        if(this.z > 0){
            fill(color(0, 0, 0, 200));
            this.diameter = pointZ/2 + tempDiameter;
        } else {
            fill(color(225, 225, 225, 200));
            this.diameter = tempDiameter;
        }
        noStroke();
        ellipse(this.x, this.y, this.diameter, this.diameter);
    }
}

function handWriting(){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.flag = false;
    
    this.update = function(){
        this.x = pointX;
        this.y = pointY;
        this.z = pointZ;
    }
    
    this.display = function(){
        if(this.z > 0){
            graph[0].push(this.x);
            graph[1].push(this.y);
            if(!this.flag){
                graph[2].push(0);
            } else {
                graph[2].push(this.z);
            }
            this.flag = true;
        } else {
            this.flag = false;
        }
        for (var i=1; i<graph[0].length; i++){
            stroke(0);
            strokeWeight(graph[2][i]/2);
            line(graph[0][i-1],graph[1][i-1],graph[0][i],graph[1][i]);
        }
    }
}

// for save mode
var d = new Date();
var year  = d.getFullYear();
var month = d.getMonth() + 1;
var day   = d.getDate();
var hour  = ( d.getHours()   < 10 ) ? '0' + d.getHours()   : d.getHours();
var min   = ( d.getMinutes() < 10 ) ? '0' + d.getMinutes() : d.getMinutes();
var sec   = ( d.getSeconds() < 10 ) ? '0' + d.getSeconds() : d.getSeconds();
var timeStamp = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec ; //shown by 2016-03-23 06:09:00

function clearFile(){
    graph[0] = [];
    graph[1] = [];
    graph[2] = [];
}

function saveFile(){
    // 本当は"memo"をtimestampにした上で、ファイルを管理したい...
    localStorage.setItem("memo", JSON.stringify(graph));
    alert("Your article is saved!");
    //showBanner();
}

function loadFile(){
    if(localStorage.getItem("memo")){
        var str = localStorage.getItem("memo");
        var obj = JSON.parse(str);
        for (var i=0; i<3; i++){
            for (var j=0; j<obj[0].length; j++){
                graph[i].push(obj[i][j]);
            }
        }
    }
    //console.log(obj);
}

function showBanner(){
    //alertの代わりにポップアップのバナーを出したいのですが、まだ出来てないです..
}
