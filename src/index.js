import React from 'react';
import ReactDOM from 'react-dom';
import Board from './component/Board';
import './style.scss';

class Game extends React.Component {
  state = {
    height: 8,
    width: 8,
    mines: 18,
  };

  render() {
    const { height, width, mines, cheatCode } = this.state;
    return (
      <div className="game">
        <Board height={height} width={width} mines={mines} />
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

