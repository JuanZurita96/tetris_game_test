import { useTetris } from "../../hooks/useTetrisLogic";
import {
  Key,
  Center,
  Content,
  ControlRow,
  ControlsContainer,
  InfoPanelContainer,
} from "./styles";
import ActiveGame from "./ActiveGame/ActiveGame";

const InfoPanel = (): JSX.Element => {
  const gameState = useTetris();

  return (
    <InfoPanelContainer>
      <Content>{gameState.started ? <ActiveGame /> : null}</Content>
      <ControlsContainer>
        <h2>Controls</h2>
        <ControlRow>
          <h4>Rotate</h4>
          <Center>
            <Key>Z</Key>
            <Key>X</Key>
          </Center>
        </ControlRow>
        <ControlRow>
          <h4>Move</h4>
          <Center>
            <Key>←</Key>
            <Key>→</Key>
          </Center>
        </ControlRow>
        <ControlRow>
          <h4>Fast Drop</h4>
          <Key>↓</Key>
        </ControlRow>
        <ControlRow>
          <h4>Hard Drop</h4>
          <Key>↑</Key>
        </ControlRow>
      </ControlsContainer>
    </InfoPanelContainer>
  );
};

export default InfoPanel;
