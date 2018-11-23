import React from "react";
import _ from "lodash";
import PriorityQueue from "./minpriorityqueue.js";

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
      this.checkforWin();
      this.checkDistanceFromWin();
    }
  }

  async solve(board) {
    const mpq = new PriorityQueue();
    const traversal = [];

    // stores the number of moves to get here (distance is always the same)
    const moveCounts = {[_.toString(board)]: 0};

    // could do traversal[traversel.length - 1];
    // add initial configuration to min priority queue (0 moves)
    mpq.insert({ moveCount: 0, board, traversal }, this.distanceFromWin(board));

    // make sure we don't crash
    const MAX_ITERATIONS = 200000;
    let iterations = 0;

    while (mpq.heap.length > 1) {

      iterations++;
      if(iterations > MAX_ITERATIONS) {
        break;
      }

      const boardState = mpq.remove();

      console.log(`priority: ${boardState.priority}`);

      const traversal = _.clone(boardState.value.traversal);

      traversal.push(boardState.value.board);

      // check for win
      if (boardState.priority === 0) {
        return traversal;
      } else {
        // get all possible moves & calculate distances from win
        const possibleMoves = [...Array(16).keys()].map(number => [
          number,
          this.doesMoveExist(number, boardState.value.board)
        ]);

        const availableMoves = _.filter(
          possibleMoves,
          element => element[1] !== false
        );

        let possibleBoards = availableMoves.map(move => {
          const tempBoard = _.clone(boardState.value.board);
          return {
            start: move[0],
            end: move[1],
            result: this.swap(move[0], move[1], tempBoard)
          };
        });

        possibleBoards = possibleBoards.map(possibleBoard => {
          return {
            ...possibleBoard,
            distance: this.distanceFromWin(possibleBoard.result)
          };
        });

        possibleBoards.map(possibleBoard => {
          if (
            (boardState.value.moveCount + 1 < moveCounts[_.toString(possibleBoard.result)]) ||
            !_.get(moveCounts, _.toString(possibleBoard.result))
          ) {
            moveCounts[_.toString(possibleBoard.result)] = boardState.value.moveCount + 1;
            mpq.insert(
              {
                moveCount: boardState.value.moveCount + 1,
                board: possibleBoard.result,
                traversal,
              },
              possibleBoard.distance
            );
          }
        });
      }
    }
  }

  checkDistanceFromWin() {
    const newState = _.cloneDeep(this.state);
    const distanceFromWin = this.distanceFromWin(
      newState.history[newState.history.length - 1].squares
    );
    if (
      newState.history[newState.history.length - 1].distanceFromWin !==
      distanceFromWin
    ) {
      newState.history[
        newState.history.length - 1
      ].distanceFromWin = distanceFromWin;
      this.setState({ history: newState.history });
    }
  }

  distanceFromWin(board) {
    const getRow = i => Math.floor(i / 4);
    const getColumn = i => i - Math.floor(i / 4) * this.ROW_SIZE;

    const scores = board.map((square, index) => {
      square = square === -1 ? 16 : square;
      const row = Math.abs(getRow(square - 1) - getRow(index));
      const column = Math.abs(getColumn(square - 1) - getColumn(index));
      return row + column;
    });

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

  async solverClick() {
    
    let traversal = await this.solve(this.state.history[this.state.history.length - 1].squares);
    console.log(traversal);

    const timeOut = async move => {
      return setTimeout(() => {
        const newState = _.cloneDeep(this.state);
        const distanceFromWin = this.distanceFromWin(move);
        newState.history.push({squares: move, distanceFromWin, gameOver: distanceFromWin === 0 ? true : false });
        this.setState({history: newState.history});
      }, 1000);
    }

    
    for(let i = 0; i < traversal.length; i++) {
      setTimeout(() => {
        const newState = _.cloneDeep(this.state);
        const distanceFromWin = this.distanceFromWin(traversal[i]);
        newState.history.push({squares: traversal[i], distanceFromWin, gameOver: distanceFromWin === 0 ? true : false });
        this.setState({history: newState.history});
      }, i * 500);
    }
    
    
    /*()
    for(let i = 0; i < 5; i++){
      setTimeout(function(){
          console.log('value is ', i);
      }, 3000);
    }
    */
    
    
    /*
    let sequence = Promise.resolve();

    traversal.forEach(move => {
      sequence = sequence.then(async () => 
        await timeOut(move)
      );
    });
    */


  }

  renderSolver() {
    return (
      <div>
        <button onClick={() => this.solverClick()}>{`Solve Puzzle`}</button>
      </div>
    );
  }

  render() {
    const { squares, gameOver, distanceFromWin } = this.state.history[
      this.state.history.length - 1
    ];
    return (
      <div>
        <div>{`Game Status: ${gameOver ? `You Win!` : `In Progress`}`}</div>
        <div>{`Distance From Win: ${distanceFromWin}`}</div>
        {this.renderSolver()}
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
