var HTMLUtil = (function () {
    function HTMLUtil() {
    }
    HTMLUtil.getAnimationFrame = function () {
        return window.requestAnimationFrame;
    };

    HTMLUtil.getEl = function (id) {
        return document.getElementById(id);
    };

    HTMLUtil.getElsByClass = function (className) {
        return document.getElementsByClassName(className);
    };

    HTMLUtil.setText = function (id, text) {
        var el = this.getEl(id);
        if (el) {
            el.innerText = text;
        }
    };

    HTMLUtil.setHtml = function (id, html) {
        var el = this.getEl(id);
        if (el) {
            el.innerHTML = html;
        }
    };

    HTMLUtil.createEl = function (elemenName) {
        return document.createElement(elemenName);
    };
    return HTMLUtil;
})();

var App = (function () {
    function App() {
    }
    App.setTitle = function (title) {
        var elements = HTMLUtil.getElsByClass("appTitle");
        for (var i in elements) {
            elements[i].innerText = title;
        }
    };
    return App;
})();

var Coords = (function () {
    function Coords(x, y) {
        this.x = x;
        this.y = y;
    }
		
		Coords.prototype.getRandomUnoccupiedCoords = function (gameBoard) {
		
				var blockOccupied = true;
				while (blockOccupied) {
 			     var unoccupiedCoords = new Coords(Math.floor(Math.random()*(gameBoard.numCols)) * gameBoard.blockSize, Math.floor(Math.random()*(gameBoard.numRows)) * gameBoard.blockSize);
					 
					 if(!gameBoard.occupied(unoccupiedCoords.x, unoccupiedCoords.y)){					 				
						   blockOccupied = false;
					 }
				}
		
        return unoccupiedCoords; 
    };
		
    return Coords;
})();

var Block = (function () {
    function Block(coordinates) {
        this.coordinates = coordinates;
        this.occupied = false;
				this.colour = Colours.White;
				this.type = "";
    }
    return Block;
})();

var BoardLayout;
(function (BoardLayout) {
    BoardLayout[BoardLayout["BlockSize"] = 33] = "BlockSize";
    BoardLayout[BoardLayout["NumCols"] = 10] = "NumCols";
    BoardLayout[BoardLayout["NumRows"] = 20] = "NumRows";
})(BoardLayout || (BoardLayout = {}));

var ScoreBoard = (function () {
    function ScoreBoard() {
        this.hiScore = 0;
        this.reset();
    }

    ScoreBoard.prototype.reset = function () {
        this.currentScore = 0;
        this.currentLevel = 1;
    };

    ScoreBoard.prototype.update = function () {
		
		//Code to increase score goes in here.
		  this.currentScore = this.currentLevel * this.currentLevel * 50; 
        if (this.currentScore > this.hiScore) {
            this.hiScore = this.currentScore;
        }

    };

    ScoreBoard.prototype.draw = function () {
        HTMLUtil.setText("hiScore", this.hiScore.toString());
        HTMLUtil.setText("score", this.currentScore.toString());
        HTMLUtil.setText("level", this.currentLevel.toString());
    };
    return ScoreBoard;
})();

var Player = (function () {
    function Player(gameBoard) {
		    this.gameBoard = gameBoard;
				this.colour = Colours.Blue;		
				var c = new Coords();
				this.coords = c.getRandomUnoccupiedCoords(gameBoard);								
				this.occupyBlock(true);		
    }
		
		Player.prototype.occupyBlock = function(isOccupied){
				this.gameBoard.setOccupied(this.coords.x, this.coords.y, isOccupied, this.colour, "player");
		}
		
		Player.prototype.move = function (direction) {
				this.occupyBlock(false);
				
        if (direction == 0 /* Up */) {
            this.coords.y -= this.gameBoard.blockSize;
				} else if (direction == 3 /* Left */) {
            this.coords.x -= this.gameBoard.blockSize;				
        } else if (direction == 1 /* Right */) {
            this.coords.x += this.gameBoard.blockSize;
        } else if (direction == 2 /* Down */) {
            this.coords.y += this.gameBoard.blockSize;
        }
				
				this.occupyBlock(true);
    };		
		
    return Player;
})();

var Goal = (function () { 
    function Goal(gameBoard) {
			  var c = new Coords();
				this.gameBoard = gameBoard;
				this.coords = c.getRandomUnoccupiedCoords(gameBoard);				
				this.colour = Colours.Yellow;
				this.blockSize = gameBoard.blockSize;
				this.gameBoard.setOccupied(this.coords.x, this.coords.y, true, this.colour, "goal");
				    }
						
    return Goal;
})();

var Beast = (function () { 
    function Beast(gameBoard) {
			  var c = new Coords();
        this.gameBoard = gameBoard;
				this.coords = c.getRandomUnoccupiedCoords(gameBoard);
				this.colour = Colours.Red;
				this.blockSize = gameBoard.blockSize;
				this.occupyBlock(true);
		}
		
		Beast.prototype.occupyBlock = function(isOccupied){
				this.gameBoard.setOccupied(this.coords.x, this.coords.y, isOccupied, this.colour, "beast");
		}
			
		Beast.prototype.move = function (direction) {
				this.occupyBlock(false);
				
        if (direction == 0 /* Up */) {
            this.coords.y -= this.gameBoard.blockSize;
				} else if (direction == 3 /* Left */) {
            this.coords.x -= this.gameBoard.blockSize;				
        } else if (direction == 1 /* Right */) {
            this.coords.x += this.gameBoard.blockSize;
        } else if (direction == 2 /* Down */) {
            this.coords.y += this.gameBoard.blockSize;
        }
				
				this.occupyBlock(true);
    };									
  
    return Beast;
})();
			
var GameBoard = (function () {
    function GameBoard(canvas, blockSize, numCols, numRows) {
        this.blocks = new Array();
        this.canvas = canvas;
        this.canvas.width = blockSize * numCols;
        this.canvas.height = blockSize * numRows;
        this.blockSize = blockSize;
        this.numCols = numCols;
        this.numRows = numRows;

        this.reset();
    }
    GameBoard.prototype.reset = function () {
        this.blocks = new Array();
        var index = 0;
        for (var x = 0; x < this.numCols; x++) {
            for (var y = 0; y < this.numRows; y++) {
                this.blocks[index] = new Block(new Coords(x, y));
                index += 1;
            }
        }				
    };
		
			
		GameBoard.prototype.generateWall = function (scoreBoard) {
        var c = new Coords();
				var numWallBlocks = (scoreBoard.currentLevel - 1) * (scoreBoard.currentLevel - 1)
				for (var x = 0; x < numWallBlocks; x++) {
						var maxBlockCount = (this.numRows * this.numCols) - 1;
						var coords = c.getRandomUnoccupiedCoords(this);
						var block = this.blocks[this.getBlockIndex(coords.x, coords.y)];
						if(block){
  						block.colour = Colours.Grey;
  						block.occupied = true;
  						block.type = "wall";
						}
        }				
    };			
		
		GameBoard.prototype.playerHasReachedGoal = function (player, goal) {
				if(player.coords.x == goal.coords.x && player.coords.y == goal.coords.y) return true;
				return false;
		};
		GameBoard.prototype.playerHasTouchedBeast = function (player, beast) {
				if(player.coords.x == beast.coords.x && player.coords.y == beast.coords.y) return true;
				return false;
		};
		
    GameBoard.prototype.getBlockIndex = function (x, y) {
        return (this.numCols * (y/this.blockSize)) + x/this.blockSize;
    };

    GameBoard.prototype.occupied = function (targetX, targetY) {
        var blockIndex = this.getBlockIndex(targetX, targetY);
        return (this.blocks[blockIndex] && this.blocks[blockIndex].occupied);
    };
		
    GameBoard.prototype.isWallType = function (targetX, targetY) {
        var blockIndex = this.getBlockIndex(targetX, targetY);
        return (this.blocks[blockIndex] && this.blocks[blockIndex].type == "wall");
    };		
		
		GameBoard.prototype.setOccupied = function (targetX, targetY, occupied, colour, type) {
        var blockIndex = this.getBlockIndex(targetX, targetY);
        if(this.blocks[blockIndex]){
						this.blocks[blockIndex].occupied = occupied;
						this.blocks[blockIndex].colour = colour;
						this.blocks[blockIndex].type = type;
				}
    };
	
    GameBoard.prototype.outsideBoundaries = function (targetX, targetY) {
        return this.outsideXBoundaries(targetX/this.blockSize) || this.outsideYBoundary(targetY/this.blockSize);
    };

		GameBoard.prototype.outsideXBoundaries = function (targetX) {
        return targetX < 0 || targetX >= this.numCols;
    };

    GameBoard.prototype.outsideYBoundary = function (targetY) {
        return targetY < 0 || targetY >= this.numRows;
    };
		
		GameBoard.prototype.movePlayerAndBeast = function (direction, player, beast) {
        var canMove = true;
        var targetXOffset = 0;
        var targetYOffset = 0;

        if (direction == 0 /* Up */) {
            targetYOffset = -1;
        } else if (direction == 3 /* Left */) {
            targetXOffset = -1;						
        } else if (direction == 1 /* Right */) {
            targetXOffset = 1;
        } else if (direction == 2 /* Down */) {
            targetYOffset = 1;
        }
								
          var x = ((player.coords.x/ this.blockSize) + targetXOffset) * this.blockSize;
          var y = ((player.coords.y/ this.blockSize) + targetYOffset) * this.blockSize;
									
					if(this.occupied(x, y) && this.isWallType(x,y)) canMove = false;
					if(this.outsideBoundaries(x, y)) canMove = false;
					
        if (canMove) {					  
            player.move(direction);											
        }
				
				var canBeastMove = false;
				
				while(!canBeastMove){
				    var diffXBeastPlayer = player.coords.x - beast.coords.x;
						diffXBeastPlayer = diffXBeastPlayer * diffXBeastPlayer;
						
						var diffYBeastPlayer = player.coords.y - beast.coords.y;
						diffYBeastPlayer = diffYBeastPlayer * diffYBeastPlayer;
						
				    direction = Math.floor(Math.random()*(4));
						
           targetXOffset = 0;
           targetYOffset = 0;
  
          if (direction == 0 /* Up */) {
              targetYOffset = -1;
          } else if (direction == 3 /* Left */) {
              targetXOffset = -1;						
          } else if (direction == 1 /* Right */) {
              targetXOffset = 1;
          } else if (direction == 2 /* Down */) {
              targetYOffset = 1;
          }
								
          x = ((beast.coords.x/ this.blockSize) + targetXOffset) * this.blockSize;
          y = ((beast.coords.y/ this.blockSize) + targetYOffset) * this.blockSize;
					
					canMove = true;
									
					if(this.occupied(x, y) && this.isWallType(x,y)) canMove = false;
					if(this.outsideBoundaries(x, y)) canMove = false;
						
					canBeastMove = canMove;
				  
					if (canBeastMove){
						 var newDiffXBeastPlayer = player.coords.x - x;
						 newDiffXBeastPlayer = newDiffXBeastPlayer * newDiffXBeastPlayer;
						 
						 var newDiffYBeastPlayer = player.coords.y - y;
						 newDiffYBeastPlayer = newDiffYBeastPlayer * newDiffYBeastPlayer;
						 
						 if (((newDiffXBeastPlayer > diffXBeastPlayer) || (newDiffYBeastPlayer > diffYBeastPlayer))){
						 		canBeastMove = false;
						 }
						 
					}
					
				}											
				beast.move(direction);	
    };

	 GameBoard.prototype.clearDrawingArea = function () {
        var context = this.canvas.getContext('2d');

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  }
		
    GameBoard.prototype.drawBlocks = function () {
        var context = this.canvas.getContext('2d');
        var index = 0;

        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                var block = this.blocks[index];

                context.beginPath();
                context.rect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                if (block.occupied) {
                    context.setLineDash([0]);
                    context.lineWidth = 3;
                    context.fillStyle = block.colour;
                    context.fill();
                } else {
                    context.setLineDash([1, 2]);
                    context.lineWidth = 1;
                }
                context.strokeStyle = 'black';
                context.stroke();
                index += 1;
            }
        }
    };

    GameBoard.prototype.drawMessage = function (message) {
        var context = this.canvas.getContext('2d');
        var textString = message;
        var textWidth = context.measureText(textString).width;
        var textHeight = 50;
        context.font = textHeight + 'px sans-serif';
        var x = (this.canvas.width / 2) - (textWidth / 2);
        var y = (this.canvas.height / 2) + (textHeight / 2);
        context.lineWidth = 3;
        context.setLineDash([0]);
        context.strokeStyle = 'black';
        context.strokeText(textString, x, y);
        context.fillStyle = "blue";
        context.fillText(textString, x, y);
    };
    return GameBoard;
})();

var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));

var Colours = (function () {
    function Colours() {
    }
    Colours.Cyan = "cyan";
    Colours.Blue = "blue";
    Colours.Orange = "orange";
    Colours.Yellow = "yellow";
    Colours.Green = "green";
    Colours.Purple = "purple";
    Colours.Red = "red";
		Colours.Lime = "lime";
		Colours.Grey = "grey";
    return Colours;
})();

var Keys;
(function (Keys) {
    Keys[Keys["RETURN"] = 13] = "RETURN";
    Keys[Keys["ESC"] = 27] = "ESC";
    Keys[Keys["SPACE"] = 32] = "SPACE";
    Keys[Keys["LEFT"] = 37] = "LEFT";
    Keys[Keys["UP"] = 38] = "UP";
    Keys[Keys["RIGHT"] = 39] = "RIGHT";
    Keys[Keys["DOWN"] = 40] = "DOWN";
})(Keys || (Keys = {}));

var GameState;
(function (GameState) {
    /*Game states Mutually exclusive so it's an incremental, not a binary index */
    GameState[GameState["Dead"] = -1] = "Dead";
		GameState[GameState["Stopped"] = 0] = "Stopped";		
    GameState[GameState["Playing"] = 1] = "Playing";
    GameState[GameState["Paused"] = 2] = "Paused";
})(GameState || (GameState = {}));
;

var GameAction;
(function (GameAction) {
    GameAction[GameAction["handled"] = -1] = "handled";
    GameAction[GameAction["movePieceUp"] = 0] = "movePieceUp";
    GameAction[GameAction["movePieceLeft"] = 1] = "movePieceLeft";
    GameAction[GameAction["movePieceRight"] = 2] = "movePieceRight";
    GameAction[GameAction["movePieceDown"] = 3] = "movePieceDown";
    GameAction[GameAction["startGame"] = 4] = "startGame";
    GameAction[GameAction["stopGame"] = 5] = "stopGame";
    GameAction[GameAction["toggleGamePause"] = 6] = "toggleGamePause";
})(GameAction || (GameAction = {}));

var currentAction;

var Game = (function () {
    function Game(gameBoard) {
        this.gameBoard = gameBoard;
        this.scoreBoard = new ScoreBoard();
        this.attachEventHandlers();
    }
    Game.prototype.attachEventHandlers = function () {
        document.addEventListener('keydown', this.keydownHandler, false);
    };

    Game.prototype.keydownHandler = function (ev) {
        switch (ev.keyCode) {
            case 37 /* LEFT */:
                currentAction = 1 /* movePieceLeft */;
                break;

            case 39 /* RIGHT */:
                currentAction = 2 /* movePieceRight */;
                break;

            case 38 /* UP */:
                currentAction = 0 /* movePieceUp */;
                break;

            case 40 /* DOWN */:
                currentAction = 3 /* movePieceDown */;
                break;

            case 32 /* SPACE */:
                currentAction = 6 /* toggleGamePause */;
                break;

            case 27 /* ESC */:
                currentAction = 5 /* stopGame */;
                break;

            case 13 /* RETURN */:
                currentAction = 4 /* startGame */;
                break;
        }

        ev.preventDefault();
    };

    Game.prototype.run = function () {
        var _this = this;
        this.reset();
        this.gameState = 0 /* Stopped */;
        var animate = HTMLUtil.getAnimationFrame();

        var gameLoop = function () {           
            _this.processInput();
						_this.update();						
            _this.draw();
            animate(gameLoop);
        };

        animate(gameLoop);
    };

	  Game.prototype.setBoardLayout = function(){
        this.gameBoard.reset();
    		this.gameBoard.generateWall(this.scoreBoard);
		    this.player = new Player(this.gameBoard);
				this.goal = new Goal(this.gameBoard);
				this.beast = new Beast(this.gameBoard);				
		}
		
    Game.prototype.reset = function () {
        this.elapsedTime = 0;
        this.gameBoard.reset();
        this.scoreBoard.reset();
				this.setBoardLayout();
        this.currentMessage = "";
    };
		
    Game.prototype.togglePause = function () {
        if (this.gameState == 1 /* Playing */) {
            this.gameState = 2 /* Paused */;
        } else if (this.gameState == 2 /* Paused */) {
            this.gameState = 1 /* Playing */;
        }
    };

    Game.prototype.start = function () {
        this.reset();
        this.gameState = 1 /* Playing */;
    };

    Game.prototype.stop = function () {
        this.gameState = 0 /* Stopped */;
    };
		
		Game.prototype.die = function () {
        this.gameState = -1 /* Dead */;
    };



    Game.prototype.processInput = function () {
        if (this.gameState == 1 /* Playing */) {
            switch (currentAction) {
                case 1 /* movePieceLeft */:
                    this.gameBoard.movePlayerAndBeast(3 /* Left */, this.player, this.beast);
                    break;

                case 2 /* movePieceRight */:
                    this.gameBoard.movePlayerAndBeast(1 /* Right */, this.player, this.beast);
                    break;

                case 0 /* movePieceUp */:
                    this.gameBoard.movePlayerAndBeast(0 /* Up */, this.player, this.beast);
                    break;

                case 3 /* movePieceDown */:
                    this.gameBoard.movePlayerAndBeast(2 /* Down */, this.player, this.beast);
                    break;

                case 6 /* toggleGamePause */:
                    this.togglePause();
                    break;

                case 5 /* stopGame */:
                    this.stop();
                    break;
            }
        } else if (this.gameState == 2 /* Paused */) {
            switch (currentAction) {
                case 6 /* toggleGamePause */:
                    this.togglePause();
                    break;

                case 5 /* stopGame */:
                    this.stop();
                    break;
            }
        } else if (this.gameState == 0 /* Stopped */ || this.gameState == -1 /* Dead */) {
            switch (currentAction) {
                case 4 /* startGame */:
                    this.start();
                    break;
            }
        }
        currentAction = -1 /* handled */;
    };

    Game.prototype.update = function () {
        this.currentMessage = "";

        if (this.gameState == 1 /* Playing */) {
				    
					 if(this.gameBoard.playerHasTouchedBeast(this.player, this.beast)) {    				  
    				  this.die();
    			  }
						      
            if (this.gameBoard.playerHasReachedGoal(this.player, this.goal)) {
					     this.scoreBoard.currentLevel += 1;
					     this.setBoardLayout();
            }
              
						this.scoreBoard.update();
        } else if (this.gameState == 2 /* Paused */) {
            this.currentMessage = "PAUSED";
        } else if (this.gameState == 0 /* Stopped */) {
            this.currentMessage = "GAME OVER";
        } else if (this.gameState == -1 /* Dead */) {
            this.currentMessage = "YOU ARE DEAD!";						
        }
    };

    Game.prototype.draw = function () {        
        
				this.gameBoard.clearDrawingArea();
				
				if (this.gameState == 1 /* Playing */) {
					 this.gameBoard.drawBlocks();
				}
				
        this.scoreBoard.draw();

        if (this.currentMessage != "") {
            this.gameBoard.drawMessage(this.currentMessage);
        }
    };
    return Game;
})();

window.onload = function () {
    App.setTitle("Maze Game");

    var gameCanvas = HTMLUtil.getEl("gameBoard");
    var gameBoard = new GameBoard(gameCanvas, 50 /* BlockSize */, 10 /* NumCols */, 10 /* NumRows */);

    var game = new Game(gameBoard);
    game.run();
};
