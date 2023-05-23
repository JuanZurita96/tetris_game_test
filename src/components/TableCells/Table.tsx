import { Suspense, lazy } from "react";
import { useTetris } from "../../hooks/useTetrisLogic";
import { HIDDEN_ROWS } from "../../utils/constants";
import { isTetriminoInPosition } from "../../utils/functions";
import { BoardPoint } from "../../interface/tetrisTypes";
import { ContainerDiv, RowDiv, CellDiv } from "./styles";

const Cell = lazy(() => import("./Cells/Cell"));

const BoardCells = (): JSX.Element => {
  const gameState = useTetris();

  return (
    <ContainerDiv>
      {gameState.placedTetrominos.map((row, rowIndex) => {
        if (rowIndex < HIDDEN_ROWS) return;
        return (
          <RowDiv key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => {
              const point = { row: rowIndex, col: colIndex } as BoardPoint;
              if (
                isTetriminoInPosition(gameState.activeTetromino.position, point)
              ) {
                return (
                  <CellDiv key={`active-tetromino-${rowIndex}-${colIndex}`}>
                    <Suspense fallback="Loading">
                      <Cell tetromino={gameState.activeTetromino.type} />
                    </Suspense>
                  </CellDiv>
                );
              } else {
                if (
                  isTetriminoInPosition(
                    gameState.activeTetromino.projectedPlacePosition,
                    point
                  )
                ) {
                  return (
                    <CellDiv
                      key={`projected-place-position-${rowIndex}-${colIndex}`}
                    >
                      <Suspense fallback="Loading">
                        <Cell
                          tetromino={gameState.activeTetromino.type}
                          isProjection
                        />
                      </Suspense>
                    </CellDiv>
                  );
                } else {
                  return (
                    <CellDiv key={`cell-${rowIndex}-${colIndex}`}>
                      <Suspense fallback="Loading">
                        <Cell tetromino={cell.tetromino} />
                      </Suspense>
                    </CellDiv>
                  );
                }
              }
            })}
          </RowDiv>
        );
      })}
    </ContainerDiv>
  );
};

export default BoardCells;
