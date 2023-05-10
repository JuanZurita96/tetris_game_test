import {
  SCORES,
  HIDDEN_ROWS,
  ROTATION_MATRIX,
  SRS_ROTATION_TESTS,
  INITIAl_TETROMINO_POSITIONS,
  ALL_TETROMINOS,
} from "./constants";
import {
  getNextTetrominos,
  getNextTetrominoPosition,
  getProyectedPlacePosition,
  getTetrominoPositionBounds,
  isInvalidTetrominoPosition,
  isTouchingPlacedTetriminosOrBottom,
} from "./functions";
import {
  GameState,
  Board,
  BoardRow,
  TetrisCallbacks,
  TetrominoRotation,
  TetrominoPosition,
  TetrominoRotationTestName,
} from "../interface/tetrisTypes";

export const getInitialGameState = (): GameState => {
  const rows = Array(20 + HIDDEN_ROWS).fill(null);
  const columns = Array(10).fill(null);
  const board = rows.map(
    () => columns.map(() => ({ tetromino: null })) as BoardRow
  ) as Board;
  const firstTetromino = ALL_TETROMINOS[0];
  return {
    started: false,
    gameOver: false,
    level: 1,
    scoreId: null,
    levelProgress: 0,
    score: 0,
    fastDrop: false,
    lockDelay: false,
    placedTetrominos: board,
    activeTetromino: {
      type: firstTetromino,
      rotation: 0,
      position: INITIAl_TETROMINO_POSITIONS[firstTetromino],
      projectedPlacePosition: getProyectedPlacePosition(
        INITIAl_TETROMINO_POSITIONS[firstTetromino],
        board
      ),
    },
    nextTetrominos: ALL_TETROMINOS.slice(1),
    callbacks: {} as TetrisCallbacks,
  };
};

export const startGame = (gameState: GameState): GameState => {
  const randomTetrominos = getNextTetrominos();
  const firstTetromino = randomTetrominos[0];
  const newState = getInitialGameState();
  return {
    ...newState,
    started: true,
    gameOver: false,
    activeTetromino: {
      ...newState.activeTetromino,
      type: firstTetromino,
      position: INITIAl_TETROMINO_POSITIONS[firstTetromino],
      projectedPlacePosition: getProyectedPlacePosition(
        INITIAl_TETROMINO_POSITIONS[firstTetromino],
        newState.placedTetrominos
      ),
    },
    nextTetrominos: randomTetrominos.slice(1),
    callbacks: {
      ...gameState.callbacks,
    },
  };
};

export const rotateTetromino = (
  gameState: GameState,
  side: "left" | "right"
): GameState => {
  const { type, position, rotation } = gameState.activeTetromino;
  if (type === "O") return gameState;
  const rotationModifier = side === "left" ? -1 : 1;
  const newRotation =
    rotation + rotationModifier < 0
      ? 3
      : (((rotation + rotationModifier) % 4) as TetrominoRotation);
  const newPosition = position.map((minoPosition, index) => {
    return {
      row:
        minoPosition.row +
        ROTATION_MATRIX[type][index][newRotation][0] -
        ROTATION_MATRIX[type][index][rotation][0],
      col:
        minoPosition.col +
        ROTATION_MATRIX[type][index][newRotation][1] -
        ROTATION_MATRIX[type][index][rotation][1],
    };
  }) as TetrominoPosition;

  if (!isInvalidTetrominoPosition(newPosition, gameState.placedTetrominos)) {
    gameState.callbacks.onRotate?.();

    return {
      ...gameState,
      activeTetromino: {
        type,
        rotation: newRotation,
        position: newPosition,
        projectedPlacePosition: getProyectedPlacePosition(
          newPosition,
          gameState.placedTetrominos
        ),
      },
    };
  }

  const tests =
    SRS_ROTATION_TESTS[gameState.activeTetromino.type][
      `${rotation}>>${newRotation}` as TetrominoRotationTestName
    ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const testPosition = newPosition.map((position) => ({
      row: position.row + test[0],
      col: position.col + test[1],
    })) as TetrominoPosition;
    if (!isInvalidTetrominoPosition(testPosition, gameState.placedTetrominos)) {
      gameState.callbacks.onSRSTrick?.();

      return {
        ...gameState,
        activeTetromino: {
          type,
          rotation: newRotation,
          position: testPosition,
          projectedPlacePosition: getProyectedPlacePosition(
            testPosition,
            gameState.placedTetrominos
          ),
        },
      };
    }
  }
  return gameState;
};

export const moveTetromino = (
  gameState: GameState,
  direction: "left" | "right" | "down"
): GameState => {
  const { position } = gameState.activeTetromino;
  const newPosition = getNextTetrominoPosition(direction, position);
  if (isInvalidTetrominoPosition(newPosition, gameState.placedTetrominos))
    return gameState;
  const [, maxRow, minCol, maxCol] = getTetrominoPositionBounds(newPosition);
  if (maxRow > 20 + HIDDEN_ROWS - 1 || minCol < 0 || maxCol > 9)
    return gameState;

  gameState.callbacks.onMove?.();

  return {
    ...gameState,
    activeTetromino: {
      ...gameState.activeTetromino,
      position: newPosition,
      projectedPlacePosition: getProyectedPlacePosition(
        newPosition,
        gameState.placedTetrominos
      ),
    },
  };
};

export const moveTetrominoDown = (gameState: GameState): GameState => {
  if (gameState.lockDelay) return gameState;
  if (gameState.fastDrop) {
    return addScore(moveTetromino(gameState, "down"), SCORES.SOFT_DROP);
  } else {
    return moveTetromino(gameState, "down");
  }
};

export const checkTetrominoLocked = (gameState: GameState): GameState => {
  if (
    !isTouchingPlacedTetriminosOrBottom(
      gameState.activeTetromino.position,
      gameState.placedTetrominos
    ) ||
    gameState.lockDelay
  )
    return gameState;
  return {
    ...gameState,
    lockDelay: true,
  };
};

export const placeLockedTetromino = (gameState: GameState): GameState => {
  const { activeTetromino, placedTetrominos, lockDelay } = gameState;
  if (
    !lockDelay ||
    !isTouchingPlacedTetriminosOrBottom(
      gameState.activeTetromino.position,
      gameState.placedTetrominos
    )
  )
    return {
      ...gameState,
      lockDelay: false,
    };
  gameState.callbacks.onPlace?.();
  const newPlacedTetriminos = placedTetrominos.map((row, rowIndex) =>
    row.map((col, colIndex) => {
      const placeMinoInPosition = activeTetromino.position.some(
        (minoPos) => minoPos.row === rowIndex && minoPos.col === colIndex
      );
      if (placeMinoInPosition) return { tetromino: activeTetromino.type };
      return col;
    })
  ) as Board;
  const newState = {
    ...gameState,
    lockDelay: false,
    placedTetrominos: newPlacedTetriminos,
  };
  return getNextTetromino(checkGameOver(clearLines(newState)));
};

export const clearLines = (gameState: GameState): GameState => {
  const { placedTetrominos } = gameState;
  const clearedLines = placedTetrominos.reduce((acc, row, rowIndex) => {
    if (row.every((col) => col.tetromino !== null)) return [...acc, rowIndex];
    return acc;
  }, [] as number[]);
  if (clearedLines.length === 0) return gameState;

  if (clearedLines.length === 4) {
    gameState.callbacks.onTetris?.();
  } else {
    gameState.callbacks.onClear?.();
  }

  const newPlacedTetrominos = Array(clearedLines.length)
    .fill(null)
    .map(
      () =>
        Array(10)
          .fill(null)
          .map(() => ({ tetromino: null })) as BoardRow
    )
    .concat(
      placedTetrominos.filter((_, rowIndex) => !clearedLines.includes(rowIndex))
    ) as Board;

  const newState = {
    ...gameState,
    placedTetrominos: newPlacedTetrominos,
  };

  return addLevelProgress(
    addScore(newState, SCORES[clearedLines.length] * newState.level),
    clearedLines.length
  );
};

export const getNextTetromino = (gameState: GameState): GameState => {
  const { nextTetrominos } = gameState;
  const nextTetromino = nextTetrominos[0];
  const newNextTetrominos = nextTetrominos.slice(1);
  const newState = {
    ...gameState,
    activeTetromino: {
      type: nextTetromino,
      rotation: 0,
      position: INITIAl_TETROMINO_POSITIONS[nextTetromino],
      projectedPlacePosition: getProyectedPlacePosition(
        INITIAl_TETROMINO_POSITIONS[nextTetromino],
        gameState.placedTetrominos
      ),
    },
    nextTetrominos: newNextTetrominos,
  } as GameState;
  return refillNextTetrominosIfNeeded(newState);
};

export const refillNextTetrominosIfNeeded = (
  gameState: GameState
): GameState => {
  const { nextTetrominos } = gameState;
  if (nextTetrominos.length > 0) return gameState;
  return {
    ...gameState,
    nextTetrominos: getNextTetrominos(),
  };
};

export const addScore = (gameState: GameState, score: number): GameState => {
  const { score: currentScore } = gameState;
  const newScore = currentScore + score;
  return {
    ...gameState,
    score: newScore,
  };
};

export const addLevelProgress = (
  gameState: GameState,
  progress: number
): GameState => {
  const { levelProgress, level } = gameState;
  const newLevelProgress = levelProgress + progress;
  if (newLevelProgress >= 5 * level) {
    return {
      ...gameState,
      levelProgress: 0,
      level: Math.min(level + 1, 15),
    };
  } else {
    return {
      ...gameState,
      levelProgress: newLevelProgress,
    };
  }
};

export const hardDropTetromino = (gameState: GameState): GameState => {
  const { activeTetromino } = gameState;
  const newPosition = activeTetromino.projectedPlacePosition;
  const score = newPosition[0].row - activeTetromino.position[0].row * 2;

  gameState.callbacks.onHardDrop?.();

  const newState = {
    ...gameState,
    lockDelay: true,
    score: gameState.score + score,
    activeTetromino: {
      ...gameState.activeTetromino,
      position: newPosition,
    },
  } as GameState;

  return placeLockedTetromino(newState);
};

export const checkGameOver = (gameState: GameState): GameState => {
  const { placedTetrominos } = gameState;
  for (let i = 0; i < HIDDEN_ROWS; i++) {
    if (placedTetrominos[i].some((col) => col.tetromino !== null)) {
      gameState.callbacks.onGameOver?.();
      return {
        ...gameState,
        started: false,
        gameOver: true,
      };
    }
  }
  return gameState;
};

export const registerCallback = (gameState: GameState) => {
  return {
    ...gameState,
    callbacks: {
      ...gameState.callbacks,
    },
  };
};
