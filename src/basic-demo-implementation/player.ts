import { Entity } from '@akolos/ts-client-server-game-synchronization';
import { DemoPlayerInput } from '../common/demo-server';

export const enum DemoInputType {
  Move = 'move',
}

export const enum MoveInputDirection {
  Forward = 'right',
  Backward = 'left',
}

// tslint:disable-next-line: interface-over-type-literal
export type BasicDemoPlayerState = {
  position: number;
};

export interface BasicDemoPlayerInput extends DemoPlayerInput {
  direction: MoveInputDirection;
}

export const demoPlayerInputApplicator = (currentState: BasicDemoPlayerState, input: BasicDemoPlayerInput): BasicDemoPlayerState => {
  const MOVE_SPEED = 0.2;

  const currentPosition = currentState.position;
  switch (input.direction) {
    case MoveInputDirection.Forward:
      return { position: currentPosition + (input.pressTime * MOVE_SPEED) };
    case MoveInputDirection.Backward:
      return { position: currentPosition - (input.pressTime * MOVE_SPEED) };
    default:
      return { position: currentPosition };
  }
};

export type DemoPlayer = Entity<BasicDemoPlayerState>;
