import { useEffect } from "react";
import { isMobile } from "react-device-detect";

import { useTetrisActions, useTetris } from "../hooks/useTetrisLogic";
import {
  Layout,
  Board,
  Center,
  NoMobile,
  RightSide,
  PlayButton,
  BoardContainer,
  StartGameContainer,
  RightSideContainer,
  BlueBackground,
} from "./styles";
import BoardCells from "../components/TableCells/Table";
import InfoPanel from "../components/Panel/InformationPanel";
import GameOver from "../components/GameOver/GameOver";

const pressedKeys: { [key in string]: boolean } = {};
const INPUT_INTERVAL = 50;
const MOVE_COOLDOWN = 200;
let moveCooldown = false;
let moveCooldownTimeout: NodeJS.Timeout;

const Tetris = (): JSX.Element => {
  const gameState = useTetris();
  const { rotate, move, start, fastDrop, hardDrop, registerCallback } =
    useTetrisActions();

  useEffect(() => {
    registerCallback("onMove");
    registerCallback("onRotate");
    registerCallback("onHardDrop");
    registerCallback("onPlace");
    registerCallback("onClear");
    registerCallback("onGameOver");
    registerCallback("onSRSTrick");
    registerCallback("onTetris");
  }, [registerCallback]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pressedKeys["ArrowLeft"] && !moveCooldown) move("left");
      if (pressedKeys["ArrowRight"] && !moveCooldown) move("right");
    }, INPUT_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [rotate, start, move, fastDrop, hardDrop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Enter" && !e.repeat) start();
      if (e.code === "ArrowLeft" && !e.repeat) {
        clearTimeout(moveCooldownTimeout);
        moveCooldown = true;
        moveCooldownTimeout = setTimeout(() => {
          moveCooldown = false;
        }, MOVE_COOLDOWN);
        move("left");
      }
      if (e.code === "ArrowRight" && !e.repeat) {
        clearTimeout(moveCooldownTimeout);
        moveCooldown = true;
        moveCooldownTimeout = setTimeout(() => {
          moveCooldown = false;
        }, MOVE_COOLDOWN);
        move("right");
      }
      if (e.code === "KeyZ" && !e.repeat) rotate("left");
      if (e.code === "KeyX" && !e.repeat) rotate("right");
      if (e.code === "ArrowDown") fastDrop(true);
      if (e.code === "ArrowUp" && !e.repeat) hardDrop();
      pressedKeys[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys[e.code] = false;
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        clearTimeout(moveCooldownTimeout);
        moveCooldown = false;
      }
      if (e.code === "ArrowDown") fastDrop(false);
    };
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
      document.removeEventListener("keydown", handleKeyUp, false);
    };
  }, [rotate, start, move, fastDrop, hardDrop]);

  const handleStartClick = () => start();

  if (isMobile)
    return (
      <Layout>
        <NoMobile>
          <div>Sorry, this game only works on desktop</div>
        </NoMobile>
      </Layout>
    );

  return (
    <Layout>
      <BoardContainer>
        <Board>
          {!gameState.started ? (
            <StartGameContainer>
              <BlueBackground />
              {gameState.gameOver && <GameOver />}
              <Center>
                <PlayButton onClick={handleStartClick}>
                  {gameState.gameOver ? "Play Again" : "Play"}
                </PlayButton>
              </Center>
            </StartGameContainer>
          ) : (
            <>
              <BoardCells />
            </>
          )}
        </Board>
      </BoardContainer>
      <RightSideContainer>
        <RightSide>
          <BlueBackground />
          <InfoPanel />
        </RightSide>
      </RightSideContainer>
    </Layout>
  );
};

export default Tetris;
