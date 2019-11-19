import { EntityInfo, EntityTargetedInput } from '@akolos/ts-client-server-game-synchronization';
import { BasicDemoPlayerState, MoveInputDirection, BasicDemoPlayerInput } from './player';

export interface KeyboardDemoinputCollectorKeycodes {
  moveLeft: number;
  moveRight: number;
}

export const createKeyboardBasicDemoInputCollector = (keyMappings: KeyboardDemoinputCollectorKeycodes) => {
  let lastCollectionTime: number;

  let leftKeyIsDown = false;
  let rightKeyIsDown = false;

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.keyCode === keyMappings.moveLeft) {
      leftKeyIsDown = true;
    }
    if (e.keyCode === keyMappings.moveRight) {
      rightKeyIsDown = true;
    }
  });
  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.keyCode === keyMappings.moveLeft) {
      leftKeyIsDown = false;
    }
    if (e.keyCode === keyMappings.moveRight) {
      rightKeyIsDown = false;
    }
  });

  const inputCollector = (entities: Array<EntityInfo<BasicDemoPlayerState>>) => {
    const now = new Date().getTime();
    const dt = lastCollectionTime != null ? now - lastCollectionTime : 0;
    lastCollectionTime = now;

    const xor = (x: boolean, y: boolean) => (x && !y) || (!x && y);
    const inputs: Array<EntityTargetedInput<BasicDemoPlayerInput>> = [];
    if (xor(leftKeyIsDown, rightKeyIsDown)) {
      const direction = leftKeyIsDown ? MoveInputDirection.Backward : MoveInputDirection.Forward;
      const input: EntityTargetedInput<BasicDemoPlayerInput> = {
        entityId: entities.filter(e => e.local)[0].id,
        input: {
          direction,
          pressTime: dt,
        },
      };
      inputs.push(input);
    }
    return inputs;
  };

  return inputCollector;
};
