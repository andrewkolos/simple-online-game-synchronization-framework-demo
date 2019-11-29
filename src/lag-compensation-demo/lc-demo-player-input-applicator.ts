import { LcMoveInputDirection, LcRotateInputDirection, LcDemoPlayerState, LcDemoPlayerInput } from './player';

export const lcDemoPlayerInputApplicator = (currentState: LcDemoPlayerState, input: LcDemoPlayerInput): LcDemoPlayerState => {
  const MOVE_SPEED = 0.1;
  const TURN_SPEED = Math.PI / 1000 / 8;

  const currentPosition = currentState.yOffset;
  const currentRotation = currentState.rotationRads;

  const stateAfterInput: LcDemoPlayerState = {
    yOffset: currentPosition,
    rotationRads: currentRotation,
    timeUntilSpawnMs: 0,
  };

  switch (input.direction) {
    case LcMoveInputDirection.Up:
      stateAfterInput.yOffset = currentPosition + (input.pressTime * MOVE_SPEED);
      break;
    case LcMoveInputDirection.Down:
      stateAfterInput.yOffset = currentPosition - (input.pressTime * MOVE_SPEED);
      break;
  }
  switch (input.rotation) {
    case LcRotateInputDirection.Clockwise:
      stateAfterInput.rotationRads = currentRotation + (input.pressTime * TURN_SPEED);
      break;
    case LcRotateInputDirection.Counterclockwise:
      stateAfterInput.rotationRads = currentRotation - (input.pressTime * TURN_SPEED);
      break;
  }
  return stateAfterInput;
};
