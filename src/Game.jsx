import React from "react";
import _ from "lodash";

class Square extends React.Component {
  render() {
    return (
      <td
        className="square"
        onClick={() => this.props.onClick(this.props.value, this.props.index)}
      >
        {this.props.value !== -1 ? this.props.value : ""}
      </td>
    );
  }
}

class Board extends React.Component {
  renderSquares(squares) {
    const boardTiles = [];
    for (let i = 0; i < this.props.ROW_SIZE; i++) {
      let rowArray = [];
      for (let j = 0; j < this.props.ROW_SIZE; j++) {
        rowArray.push(
          <Square
            value={squares[i * this.props.ROW_SIZE + j]}
            key={i * this.props.ROW_SIZE + j}
            index={i * this.props.ROW_SIZE + j}
            onClick={this.props.onSquareClick}
          />
        );
      }
      boardTiles.push(<tr key={i}>{rowArray}</tr>);
    }
    return boardTiles;
  }

  render() {
    const { squares } = this.props;

    return (
      <table className="table">
        <tbody>{this.renderSquares(squares)}</tbody>
      </table>
    );
  }
}

class Game extends React.Component {
  ROW_SIZE = 4;
  GRID_SIZE = this.ROW_SIZE * this.ROW_SIZE;

  state = {
    history: [
      {
        squares: this.initializeBoard(),
        gameOver: false
      }
    ]
  };

  componentDidMount() {
    this.checkDistanceFromWin();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.history[prevState.history.length - 1].squares !==
        this.state.history[this.state.history.length - 1].squares &&
      !prevState.history[prevState.history.length - 1].gameOver
    ) {
      // console.log(this.checkforWin());
      this.checkforWin();
      this.checkDistanceFromWin();
    }
  }

  checkDistanceFromWin() {
    const newState = _.cloneDeep(this.state);
    const distanceFromWin = this.distanceFromWin(
      newState.history[newState.history.length - 1].squares
    );
    if(newState.history[
      newState.history.length - 1
    ].distanceFromWin !== distanceFromWin) {
      newState.history[
        newState.history.length - 1
      ].distanceFromWin = distanceFromWin;
      this.setState({ history: newState.history });
    }
  }

  distanceFromWin(board) {
    const getRow = i => Math.floor(i / 4);
    const getColumn = i => i - (Math.floor(i / 4) * this.ROW_SIZE);

    const scores = board.map(
      (square, index) => {
        square = square === -1 ? 16 : square;
        const row = Math.abs(getRow(square - 1) - getRow(index));
        const column = Math.abs(getColumn(square - 1) - getColumn(index));
        return row + column;
      }
    );

    return _.sum(scores);
  }

  initializeBoard() {
    let numbers = [...Array(15).keys()];
    numbers = numbers.map(number => number + 1);
    numbers.push(-1);

    // sort the board
    const initialMoves = Math.floor(Math.random() * 300);
    for (let i = 0; i < initialMoves; i++) {
      const possibleMoves = [...Array(16).keys()].map(number => [
        number,
        this.doesMoveExist(number, numbers)
      ]);
      const availableMoves = _.filter(
        possibleMoves,
        element => element[1] !== false
      );
      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];

      numbers = this.swap(randomMove[0], randomMove[1], numbers);
    }

    return numbers;
  }

  swap(index1, index2, board) {
    const temp = board[index1];
    board[index1] = board[index2];
    board[index2] = temp;
    return board;
  }

  doesMoveExist(index, board) {
    let [up, right, down, left] = [
      index < this.ROW_SIZE ? null : index - this.ROW_SIZE,
      (index + 1) % this.ROW_SIZE === 0 ? null : index + 1,
      index >= this.GRID_SIZE - this.ROW_SIZE ? null : index + this.ROW_SIZE,
      index % this.ROW_SIZE === 0 ? null : index - 1
    ];

    const moves = _.filter(
      [up, right, down, left].map(move => {
        if (move != null) {
          if (board[move] === -1) {
            return move;
          }
          return false;
        }
        return false;
      }),
      move => move !== false
    );
    return moves.length > 0 ? moves[0] : false;
  }

  onSquareClick = (value, index) => {
    if (_.get(this.state.history[this.state.history.length - 1], "gameOver")) {
      return false;
    }

    const move = this.doesMoveExist(
      index,
      this.state.history[this.state.history.length - 1].squares
    );
    if (move !== false) {
      let newState = _.cloneDeep(this.state);
      let newBoard = this.swap(index, move, [
        ...newState.history[newState.history.length - 1].squares
      ]);
      newState.history.push({ squares: newBoard });
      this.setState({ history: newState.history });
    }
  };

  checkforWin() {
    const win = this.state.history[this.state.history.length - 1].squares.every(
      (square, index) => {
        return index < this.GRID_SIZE - 1 ? square === index + 1 : true;
      }
    );
    let newState = _.cloneDeep(this.state);
    if (newState.history[newState.history.length - 1].gameOver !== win) {
      newState.history[newState.history.length - 1].gameOver = !newState
        .history[newState.history.length - 1].gameOver;
      this.setState({ history: newState.history });
    }
    return win;
  }

  historyClick(index) {
    let newState = _.cloneDeep(this.state);
    newState.history = newState.history.slice(0, index + 1);
    this.setState({ history: newState.history });
  }

  renderHistory() {
    const gameHistory = this.state.history;
    const historyButtons = gameHistory.map((frame, index) => (
      <div key={index}>
        <button
          onClick={() => this.historyClick(index)}
        >{`Move ${index}`}</button>
      </div>
    ));

    return <React.Fragment>{historyButtons}</React.Fragment>;
  }

  render() {
    const { squares, gameOver, distanceFromWin } = this.state.history[
      this.state.history.length - 1
    ];
    return (
      <div>
        <div>{`Game Status: ${gameOver ? `You Win!` : `In Progress`}`}</div>
        <div>{`Distance From Win: ${distanceFromWin}`}</div>
        <div>
          <Board
            squares={squares}
            onSquareClick={this.onSquareClick}
            ROW_SIZE={this.ROW_SIZE}
            GRID_SIZE={this.GRID_SIZE}
          />
        </div>
        {this.renderHistory()}
      </div>
    );
  }
}

export default Game;
