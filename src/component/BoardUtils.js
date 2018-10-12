  // General functions that could be used to create a variation of the game
  
  // plant mines on the board
  export function getRandomNumber(dimension) {
    // return Math.floor(Math.random() * dimension);
    return Math.floor((Math.random() * 1000) + 1) % dimension;
  }

  export function plantMines(data, height, width, mines) {
    let randomX, randomY, minesPlanted = 0;

    while (minesPlanted < mines) {
      randomX = this.getRandomNumber(width);
      randomY = this.getRandomNumber(height);
      if (!(data[randomX][randomY].isMine)) {
        data[randomX][randomY].isMine = true;
        minesPlanted++;
      }
    }

    return (data);
  }

  export function createEmptyArray(height, width) {
    let data = [];

    for (let i = 0; i < height; i++) {
      data.push([]);
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: i,
          y: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlagged: false,
        };
      }
    }
    return data;
  }

    // looks for neighbouring cells and returns them
    export function traverseBoard(x, y, data, height, width) {
      const el = [];
  
      //up
      if (x > 0) { el.push(data[x - 1][y]); }
  
      //down
      if (x < height - 1) { el.push(data[x + 1][y]); }
  
      //left
      if (y > 0) { el.push(data[x][y - 1]); }
  
      //right
      if (y < width - 1) { el.push(data[x][y + 1]); }
  
      // top left
      if (x > 0 && y > 0) { el.push(data[x - 1][y - 1]); }
  
      // top right
      if (x > 0 && y < width - 1) { el.push(data[x - 1][y + 1]); }
  
      // bottom right
      if (x < height - 1 && y < width - 1) { el.push(data[x + 1][y + 1]); }
  
      // bottom left
      if (x < height - 1 && y > 0) { el.push(data[x + 1][y - 1]); }
  
      return el;
    }
  