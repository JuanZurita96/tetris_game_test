import React, { Suspense } from "react";
import { useTetris } from "../../../hooks/useTetrisLogic";
import {
  Center,
  NextRow,
  NextCell,
  Container,
  LevelNumber,
  ScoreNumber,
  NextContainer,
} from "./styles";
import { isTetriminoInPosition } from "../../../utils/functions";
import {
  ROTATION_MATRIX,
  EMPTY_DISPLAY_CELLS_3x3,
  EMPTY_DISPLAY_CELLS_4x3,
} from "../../../utils/constants";

const Cell = React.lazy(() => import("../../TableCells/Cells/Cell"));

const ActiveGame = (): JSX.Element => {
  const gameState = useTetris();

  const EmptyDisplayCells =
    gameState.nextTetrominos[0] === "I" || gameState.nextTetrominos[0] === "O"
      ? EMPTY_DISPLAY_CELLS_4x3
      : EMPTY_DISPLAY_CELLS_3x3;

  return (
    <Container>
      <div>
        <h2>Next</h2>
        <Center>
          <NextContainer
            shrink={
              gameState.nextTetrominos[0] !== "I" &&
              gameState.nextTetrominos[0] !== "O"
            }
          >
            {EmptyDisplayCells.map((row, rowIndex) => {
              return (
                <NextRow key={`next-tetromino-row-${rowIndex}`}>
                  {row.map((_, colIndex) => {
                    return (
                      <NextCell
                        key={`next-tetromino-cell-${rowIndex}-${colIndex}`}
                      >
                        {isTetriminoInPosition(
                          [
                            {
                              row: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][0][0][0],
                              col: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][0][0][1],
                            },
                            {
                              row: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][1][0][0],
                              col: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][1][0][1],
                            },
                            {
                              row: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][2][0][0],
                              col: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][2][0][1],
                            },
                            {
                              row: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][3][0][0],
                              col: ROTATION_MATRIX[
                                gameState.nextTetrominos[0]
                              ][3][0][1],
                            },
                          ],
                          {
                            row: rowIndex,
                            col: colIndex,
                          }
                        ) && (
                          <>
                            <Suspense fallback="Loading">
                              <Cell tetromino={gameState.nextTetrominos[0]} />
                            </Suspense>
                          </>
                        )}
                      </NextCell>
                    );
                  })}
                </NextRow>
              );
            })}
          </NextContainer>
        </Center>
      </div>
      <div>
        <h2>Level</h2>
        <LevelNumber>{gameState.level}</LevelNumber>
      </div>
      <div>
        <h2>Score</h2>
        <ScoreNumber>{gameState.score}</ScoreNumber>
      </div>
    </Container>
  );
};

export default ActiveGame;
