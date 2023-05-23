import { useTetris } from "../../hooks/useTetrisLogic";
import { GameOverContainer } from "./styles";

const GameOver = (): JSX.Element => {
  const gameState = useTetris();

  return (
    <GameOverContainer>
      <h1>Game Over!</h1>
      <h3>Score</h3>
      <h2>{gameState.score}</h2>
    </GameOverContainer>
  );
};

export default GameOver;
