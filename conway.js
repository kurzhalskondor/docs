// wait function from internet
function wait(ms)
{
var d = new Date();
var d2 = null;
do { d2 = new Date(); }
while(d2-d < ms);
}


// set some base parameters
let board = [];
let boardWidth = 20;
let boardHeight = 10;

const cell = {
  isAlive: false
}

let livingCells = [
  {x: 1, y: 1},
  {x: 2, y: 2},
  {x: 0, y: 3},
  {x: 1, y: 3},
  {x: 2, y: 3},
]


// prepare board for simulation
const resetBoard = () => {
  let newBoard = [];
  for (let x = 0; x < boardWidth; x++){

    for (let y = 0; y < boardHeight; y++){
      let newCell = Object.create(cell);
      newCell.x = x;
      newCell.y = y;
      newBoard.push(newCell);
    }
  }
  return newBoard;

}

// place the living cells on the board
const seedLiving = (livingCells) => {
  livingCells.map( livingCell => {
    if (livingCell.x < boardWidth && livingCell.y < boardHeight){
      board.find( (cell) => cell.x === livingCell.x && cell.y === livingCell.y).isAlive = true;
    }
  })
}

// get the number of living neighbours for a given cell
const countLivingNeighbours = (currentCell, givenBoard) => {
  let livingNeighbours = 0;
  let neighbour;
  for (let x = Math.max(currentCell.x - 1, 0); x <= Math.min(currentCell.x + 1, boardWidth - 1); x++) {
    for (let y = Math.max(currentCell.y - 1, 0); y <= Math.min(currentCell.y + 1, boardHeight - 1); y++) {
      if ( !(x === currentCell.x && y === currentCell.y) ){
        neighbour = givenBoard.find( (cell) => cell.x === x && cell.y === y)
        // console.log(neighbour);
        if (neighbour.isAlive){
          livingNeighbours++;
        }
      }
    }
  }
  return livingNeighbours;
}



// create a visual representation of the board in the console
const drawBoard = (drawnBoard) => {
  // let line;
  for (let y = 0; y < boardHeight; y++){
    let line = "";
    for (let x = 0; x < boardWidth; x++){
      if (drawnBoard.find( (cell) => cell.x === x && cell.y === y).isAlive){
        line += "c ";
      } else {
        line += "  ";
      }
    }
    // avoid console counting up on same output
    if (y % 2 == 0){
      line += " ";
    }
    console.log(line);
  }

}


// simulate one game action for all fields. 
// Current issue: changes individual states before assessing all changes
const gameTick = () => {
  let hadChanges = false;
  let newBoard = resetBoard();
  board.map ( (cell, index) => {
    let livingNeighboursTemp = countLivingNeighbours(cell, board);
    if (cell.isAlive){
      newBoard[index].isAlive = true;
      if ( livingNeighboursTemp < 2 || livingNeighboursTemp > 3){
        newBoard[index].isAlive = false;
        hadChanges = true;
      }
    } else {
      if (livingNeighboursTemp === 3){
        // cell.isAlive = true;
        newBoard[index].isAlive = true;
        hadChanges = true;
      }
    }
    
  })
  
  board = newBoard;
  return hadChanges;
}

// triggers the game to start (dependent on additional wait function)
const startGame = ( waitDuration, maxTicks ) => {
  let tick = 1;
  let isNotStatic = true;
  while (tick <= maxTicks && isNotStatic) {
    console.log("Gametick " + tick + " of " + maxTicks);
    drawBoard(board);
    wait(waitDuration);
    isNotStatic = gameTick();
    if (!isNotStatic){
      console.log("not more changes recorded");
      console.log("Game over");
    }
    tick++;
  }
} 

// start everything
board = resetBoard();
seedLiving(livingCells);
drawBoard(board);
// startGame(500, 30);
