import { ClientEntitySyncerRunner } from '@akolos/ts-client-server-game-synchronization';
import { BasicDemoPlayerState, BasicDemoPlayerInput } from '../../basic-demo-implementation/player';

export type BasicDemoClientEntitySyncerRunner = ClientEntitySyncerRunner<BasicDemoPlayerInput, BasicDemoPlayerState>;
