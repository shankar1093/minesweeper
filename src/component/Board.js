import React from 'react';
import PropTypes from 'prop-types';
import Cell from './Cell';
import Button from 'muicss/lib/react/button';

export default class Board extends React.Component {
  state = {
    boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
    gameStatus: "Game in progress",
    mineCount: this.props.mines,
    moveCount: 0,
    plantMines: false,
    cheatCode: false,
    cheatCodeValue: "",
    key_map: {13: false, 16: false}
  };

  handleKeyPress = this.handleKeyPress.bind(this);

  /* Helper Functions */

  // get mines
  getItems(data, type) {
    let mineArray = [];

    data.forEach(datarow => {
        datarow.forEach(dataitem => {
            switch(type) {
                case "mine":
                if (dataitem.isMine) {
                    mineArray.push(dataitem);
                }
                break;
                case "flag":
                if (dataitem.isFlagged) {
                    mineArray.push(dataitem);
                }
                break;
                case "hidden":
                if (dataitem.isRevealed) {
                    mineArray.push(dataitem);
                }
                break;
            default:
                return <h1>Something went wrong.</h1>;
            }

        });
    });
   
    return mineArray;
  }


  // get random number given a dimension
  getRandomNumber(dimension) {
    // return Math.floor(Math.random() * dimension);
    return Math.floor((Math.random() * 1000) + 1) % dimension;
  }

  // Gets initial board data
  initBoardData(height, width, mines) {
    let data = this.createEmptyArray(height, width);
    data = this.plantMines(data, height, width, mines);
    data = this.getNeighbours(data, height, width);
    return data;
  }

  createEmptyArray(height, width) {
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

  // plant mines on the board
  plantMines(data, height, width, mines) {
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

  // This function is used to move a mine from the current location
  // This ensures that the first move will not be a mine. 

  moveMine(data, x,y) {
      if (!data[x][y].isMine) {
          console.log("This function should only be called to move mines. No mine found at this location.")
          return null;
      }
      let mineMoved = false;

      const tempBoard = this.state.boardData;
      tempBoard[x][y].isMine = false;
      this.setState({tempBoard});

      let randomX, randomY
      randomX = this.getRandomNumber(this.props.width);
      randomY = this.getRandomNumber(this.props.height);
      while (!mineMoved) {
          if (data[randomX][randomY].isEmpty) {
              data[randomX][randomY].isMine = true;
            //   this.state.boardData[x][y].isEmpty = false;
              mineMoved = true;
          } else {
            randomX = this.getRandomNumber(this.props.width);
            randomY = this.getRandomNumber(this.props.height);
          }
      }
      return data;
  }
  // get number of neighbouring mines for each board cell
  getNeighbours(data, height, width) {
    let updatedData = data

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (data[i][j].isMine !== true) {
          let mine = 0;
          const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
          area.forEach(value => {
            if (value.isMine) {
              mine++;
            }
          });
          if (mine === 0) {
            updatedData[i][j].isEmpty = true;
          }
          updatedData[i][j].neighbour = mine;
        }
      }
    }

    return (updatedData);
  };

  // looks for neighbouring cells and returns them
  traverseBoard(x, y, data) {
    const el = [];

    //up
    if (x > 0) { el.push(data[x - 1][y]); }

    //down
    if (x < this.props.height - 1) { el.push(data[x + 1][y]); }

    //left
    if (y > 0) { el.push(data[x][y - 1]); }

    //right
    if (y < this.props.width - 1) { el.push(data[x][y + 1]); }

    // top left
    if (x > 0 && y > 0) { el.push(data[x - 1][y - 1]); }

    // top right
    if (x > 0 && y < this.props.width - 1) { el.push(data[x - 1][y + 1]); }

    // bottom right
    if (x < this.props.height - 1 && y < this.props.width - 1) { el.push(data[x + 1][y + 1]); }

    // bottom left
    if (x < this.props.height - 1 && y > 0) { el.push(data[x + 1][y - 1]); }

    return el;
  }

  // reveals the whole board
  revealBoard() {
    let updatedData = this.state.boardData;
    updatedData.forEach((datarow) => {
      datarow.forEach((dataitem) => {
        dataitem.isRevealed = true;
      });
    });
    this.setState({
      boardData: updatedData
    })
  }

  /* reveal logic for empty cell */
  revealEmpty(x, y, data) {
    let area = this.traverseBoard(x, y, data);
    area.forEach(value => {
      if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
        data[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          this.revealEmpty(value.x, value.y, data);
        }
      }
    });
    return data;
  }

  // Handle User Events

  validateBoard(e) {
    let updatedData = this.state.boardData;
    const mineArray = this.getItems(updatedData, "mine");
    const FlagArray = this.getItems(updatedData, "flag");
    const hiddenArray = this.getItems(updatedData, "hidden");

    if (this.state.gameStatus === "You Lost.") {
        alert("...You really did lose.")
        return null;
    }

    if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
      this.setState({ mineCount: 0, gameStatus: "You Win." });
      this.revealBoard();
      alert("You Win");
    } else {
        alert("You have not found all mines")
        return null;
    }
    if (JSON.stringify(mineArray) === JSON.stringify(hiddenArray)) {
        this.setState({ mineCount: 0, gameStatus: "You Win." });
        this.revealBoard();
        alert("You Win");
      } else {
          alert("You have not found all mines")
          return null;
      }
      
  }
  handleCellClick(x, y) {
    this.setState({moveCount:this.state.moveCount+1});
    if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

    let updatedData = this.state.boardData;
    updatedData[x][y].isFlagged = false;
    updatedData[x][y].isRevealed = true;

    // move mine if the first click is a mine
    if (this.state.boardData[x][y].isMine && this.state.moveCount === 0) {
        this.moveMine(updatedData,x,y);
        updatedData = this.revealEmpty(x, y, updatedData);
    }
    // check if mine. game over if true
    if (this.state.boardData[x][y].isMine) {
      this.setState({ gameStatus: "You Lost." });
      this.revealBoard();
      alert("game over");
    }

    if (updatedData[x][y].isEmpty) {
      updatedData = this.revealEmpty(x, y, updatedData);
    }

    if (this.getItems(updatedData, "hidden").length === this.props.mines) {
      this.setState({ mineCount: 0, gameStatus: "You Win." });
      this.revealBoard();
      alert("You Win");
    }

    this.setState({
      boardData: updatedData,
      mineCount: this.props.mines - this.getItems(updatedData, "flag").length,
    });
  }
  
  newGame(e) {
      e.preventDefault();
      this.setState({boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
        gameStatus: "Game in progress",
        mineCount: this.props.mines,
        moveCount: 0,
        plantMines: false,
        cheatCodeValue: ""
       });
    }


  handleKeyPress(e) {
      e.preventDefault();
    //   const map = this.state.key_map    
    //   let part_1 = false;
    //   let part_2 = false;
    //   if (e.keyCode in this.state.key_map) {
    //       map[e.keyCode] = true;
    //       this.setState({map})
    //       if (map[13] && map[16]){
    //           console.log("1")
    //           part_1 = true;
    //           map[13] = false;
    //           map[16] = false;
    //           this.setState({map})
    //       }
    //       if (part_1 && map[13]){
    //           console.log("2")
    //           part_1 = false;
    //           part_2 = true;
    //           map[13] = false;
    //           console.log(this.state.cheatCodeValue)
    //       }
          
          if (this.state.cheatCodeValue === "XYZZY") {
              this.setState({cheatCode:true})
              console.log("CHEATER")
          }
            
        this.setState({cheatCodeValue: this.state.cheatCodeValue + String.fromCharCode(e.keyCode)});
    }
  

  handleKeyReleased(e) {
      const map = this.state.key_map
      map[e.keyCode] = false
      this.setState({map});
}

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyReleased);
  }
  
  handleContextMenu(e, x, y) {
    e.preventDefault();
    let updatedData = this.state.boardData;
    let mines = this.state.mineCount;

    // check if already revealed
    if (updatedData[x][y].isRevealed) return;

    if (updatedData[x][y].isFlagged) {
      updatedData[x][y].isFlagged = false;
      mines++;
    } else {
      updatedData[x][y].isFlagged = true;
      mines--;
    }

    if (mines === 0) {
      const mineArray = this.getItems(updatedData, "mine");
      const FlagArray = this.getItems(updatedData, "flag");
      if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
        this.setState({ mineCount: 0, gameStatus: "You Win." });
        this.revealBoard();
        alert("You Win");
      } 
    }

    this.setState({
      boardData: updatedData,
      mineCount: mines,
    });
  }

  renderBoard(data) {
    return data.map((datarow) => {
      return datarow.map((dataitem) => {
        return (
          <div key={dataitem.x * datarow.length + dataitem.y}>
            <Cell
              onClick={() => this.handleCellClick(dataitem.x, dataitem.y)}
              cMenu={(e) => this.handleContextMenu(e, dataitem.x, dataitem.y)}
              value={dataitem}
              cheatCode={this.state.cheatCode}
            />
            {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
          </div>);
      })
    });

  }

  render() {
    return (
      <div className="board">
        <div className="game-info">
          <span className="info">Mines: {this.state.mineCount}</span>
          <h1 className="info">{this.state.gameStatus}</h1>
        </div>
        {
          this.renderBoard(this.state.boardData)
        }

        <Button variant="flat" onClick={(e) => {this.newGame(e)}}>
            <span className="info">New Game</span>
        </Button>
        <Button onClick={(e) => {this.validateBoard(e)}}>
            <span className="info">Validate</span>
        </Button>
        </div>
    );
  }
}

Board.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  mines: PropTypes.number,
  cheatCode: PropTypes.bool,
}