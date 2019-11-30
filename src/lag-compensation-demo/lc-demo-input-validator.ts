import { InputValidator, Entity } from '@akolos/ts-client-server-game-synchronization';
import { LcDemoPlayerInput, LcDemoPlayerState } from './player';

export const makeLcDemoinputValidator = (): InputValidator<LcDemoPlayerInput, LcDemoPlayerState> => {
  return (e: Entity<LcDemoPlayerState>, _input: LcDemoPlayerInput) => {
    return e.state.timeUntilSpawnMs <= 0;
  };
};
