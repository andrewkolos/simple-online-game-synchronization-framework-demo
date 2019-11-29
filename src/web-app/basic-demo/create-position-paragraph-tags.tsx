import React from 'react';
import { BasicDemoPlayerState } from '../../basic-demo-implementation/player';
import { Entity } from '@akolos/ts-client-server-game-synchronization';

export function createPositionParagraphTags(entities: Array<Entity<BasicDemoPlayerState>>): JSX.Element[] {
  return entities.map((entity: Entity<BasicDemoPlayerState>) => <p key={entity.id}>{`${entity.id}: ${entity.state.position.toFixed(3)}`} </p>);
}
