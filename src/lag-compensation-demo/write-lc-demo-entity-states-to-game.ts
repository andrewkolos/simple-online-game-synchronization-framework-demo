import { Entity } from '@akolos/ts-client-server-game-synchronization';
import { LcDemoPlayerState } from './player';
import { LcDemoGameState } from './lc-demo-game-state';
import { LcDemoEntityId } from './lc-demo-entity-ids';

export function writeLcDemoEntityStatesToGame(entities: Array<Entity<LcDemoPlayerState>>, gameState: LcDemoGameState) {
  entities.forEach((p: Entity<LcDemoPlayerState>) => {
    if (p.id !== LcDemoEntityId.P1 && p.id !== LcDemoEntityId.P2) {
      throw Error(`Encountered invalid entity ID when synchronizing, ${p.id}.`);
    }

    const player = p.id === LcDemoEntityId.P1 ? gameState.player1 : gameState.player2;
    player.yOffset = p.state.yOffset;
    player.rotationRads = p.state.rotationRads;
    player.timeUntilSpawnMs = p.state.timeUntilSpawnMs;
  });
}
