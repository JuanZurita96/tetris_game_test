import { TetrisProvider } from "./hooks/useTetrisLogic";
import Tetris from "./components/Tetris";

function App() {
  return (
    <TetrisProvider>
      <Tetris />
    </TetrisProvider>
  );
}

export default App;
