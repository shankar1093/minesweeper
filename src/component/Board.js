import React from 'react';
import PropTypes from 'prop-types';
import Cell from './Cell';
import * as boardUtils from './BoardUtils';


export default class Board extends React.Component {
  state = {
    gameSessionId: boardUtils.getRandomNumber(100000000),
    boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
    gameStatus: "Game in progress",
    mineCount: this.props.mines,
    moveCount: 0,
    plantMines: false,
    timer: 0,
    cheatCode: false,
    cheatCodeValue: "",
  }


  handleKeyPress = this.handleKeyPress.bind(this);
  /* Helper Functions */

  // get mines
  getItems(data, type) {
    let mineArray = [];

    data.forEach(datarow => {
      datarow.forEach(dataitem => {
        switch (type) {
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
            if (!dataitem.isRevealed) {
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


  // Gets initial board data
  initBoardData(height, width, mines) {
    let data = boardUtils.createEmptyArray(height, width);
    data = boardUtils.plantMines(data, height, width, mines);
    data = this.getNeighbours(data, height, width);
    return data;
  }

  // get number of neighbouring mines for each board cell
  getNeighbours(data, height, width) {
    let updatedData = data

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (data[i][j].isMine !== true) {
          let mine = 0;
          const area = boardUtils.traverseBoard(data[i][j].x, data[i][j].y, data, height, width);
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


  // This function is used to move a mine from the current location
  // This ensures that the first move will not be a mine. 

  moveMine(data, x, y) {
    if (!data[x][y].isMine) {
      console.log("This function should only be called to move mines. No mine found at this location.")
      return null;
    }
    let mineMoved = false;

    const tempBoard = this.state.boardData;
    tempBoard[x][y].isMine = false;
    this.setState({ tempBoard });

    let randomX, randomY
    randomX = boardUtils.getRandomNumber(this.props.width);
    randomY = boardUtils.getRandomNumber(this.props.height);
    while (!mineMoved) {
      if (data[randomX][randomY].isEmpty) {
        data[randomX][randomY].isMine = true;
        mineMoved = true;
      } else {
        randomX = boardUtils.getRandomNumber(this.props.width);
        randomY = boardUtils.getRandomNumber(this.props.height);
      }
    }
    return data;
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
    let area = boardUtils.traverseBoard(x, y, data, this.props.height, this.props.width);
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

  tick () {
    this.setState({timer: (this.state.timer + 1)})
  }
  startTimer () {
    clearInterval(this.timer)
    this.timer = setInterval(this.tick.bind(this), 1000)
  }
  stopTimer () {
    clearInterval(this.timer)
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
    if (JSON.stringify(mineArray) === JSON.stringify(hiddenArray)) {
      this.setState({ mineCount: 0, gameStatus: "You Win." });
      this.revealBoard();
      this.stopTimer();
      alert("You Win 😎");
    } else if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
      this.setState({ mineCount: 0, gameStatus: "You Win." });
      this.revealBoard();
      this.stopTimer();
      alert("You Win 😎");
    } else {
      alert("You have not found all mines")
      return null;
    }
  }

  handleCellClick(x, y) {
    this.setState({ moveCount: this.state.moveCount + 1 });
    this.startTimer()
    if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

    let updatedData = this.state.boardData;
    updatedData[x][y].isFlagged = false;
    updatedData[x][y].isRevealed = true;

    // move mine if the first click is a mine
    if (this.state.boardData[x][y].isMine && this.state.moveCount === 0) {
      this.moveMine(updatedData, x, y);
      updatedData = this.revealEmpty(x, y, updatedData);
    }
    // check if mine. game over if true
    if (this.state.boardData[x][y].isMine) {
      this.setState({ gameStatus: "You Lost." });
      this.stopTimer();
      this.revealBoard();
      alert("game over 😞");
    }

    if (updatedData[x][y].isEmpty) {
      updatedData = this.revealEmpty(x, y, updatedData);
    }
    /* Comment this out for auto validation */

    // if (this.getItems(updatedData, "hidden").length === this.props.mines) {
    //   this.setState({ mineCount: 0, gameStatus: "You Win." });
    //   this.revealBoard();
    //   alert("You Win 😎");
    // }

    this.setState({
      boardData: updatedData,
      mineCount: this.props.mines - this.getItems(updatedData, "flag").length,
    });
    /* this will log an array of a unique gameSessionId, time, board state and cheatcode status
    Every game will be given a unique game id and that is used a key to map the board states. 
    
    TO-DO: Push these front end logs to some location for further analysis. Potential to use for Ml algos
    */
    console.log([this.state.gameSessionId, Date.now(), this.state.boardData, this.state.cheatCode])
  }

  newGame(e) {
    e.preventDefault();
    this.setState({
      boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
      gameStatus: "Game in progress",
      mineCount: this.props.mines,
      moveCount: 0,
      plantMines: false,
      timer: 0,
      cheatCodeValue: "",
      cheatCode:false,
      gameSessionId: boardUtils.getRandomNumber(1000),
    });
  }


 // Cheat Code Handler
  handleKeyPress(e) {
    e.preventDefault();
    if (this.state.cheatCodeValue === "XYZZY") {
      this.setState({ cheatCode: true })
      console.log("CHEATER")
    }

    this.setState({ cheatCodeValue: this.state.cheatCodeValue + String.fromCharCode(e.keyCode) });
  }
  
  handleKeyReleased(e) {
    const map = this.state.key_map
    map[e.keyCode] = false
    this.setState({ map });
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyReleased);
    clearInterval(this.timer)

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

    /* Comment this out for auto validation when flags are used to find mines*/

    // if (mines === 0) {
    //   const mineArray = this.getItems(updatedData, "mine");
    //   const FlagArray = this.getItems(updatedData, "flag");

    //     if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
    //       this.setState({ mineCount: 0, gameStatus: "You Win." });
    //       this.revealBoard();
    //       alert("You Win 😎");
    //     } 
    // }

    this.setState({
      boardData: updatedData,
      mineCount: mines,
    });
  }

  setTimer(e) {
    e.preventDefault();

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
          <span className="info">🎲: {this.state.moveCount}</span>
          <span className="info">💣: {this.state.mineCount}</span>
          <span className="info">🕛 : {this.state.timer}</span>
          <h1 className="info">{this.state.gameStatus}</h1>
        </div>
        

        <div className="rules-left"><code>right click</code> : flag</div>
        <div className="rules-right"><code>left click</code>  : reveal cell</div>
        {
          this.renderBoard(this.state.boardData)
        }
        <button className="button-ng" onClick={(e) => { this.newGame(e) }}>
          <h3 className="info">New Game</h3>
        </button>
        <button className="button-v" onClick={(e) => { this.validateBoard(e) }}>
          <h3 className="info">Validate</h3>
        </button>

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