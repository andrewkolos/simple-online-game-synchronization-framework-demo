import { TwoWayMessageBuffer, InputMessage, StateMessage, Entity, ServerEntitySyncer, ServerEntitySyncerRunner, InputApplicator, OnServerSynchronizedEvent } from '@akolos/ts-client-server-game-synchronization';
import { EventEmitter } from 'typed-event-emitter';
import { BasicDemoPlayerState } from './player';

export interface DemoPlayerInput {
  pressTime: number;
}

interface PlayerMovementInfo {
  entityId: string;
  lastInputTimestamp: number;
  pressTimeDuringLastInput: number;
  totalPressTimeInLast10Ms: number;
}

type StateAssigner<PlayerState> = (entityId: string) => PlayerState;

export class DemoSyncServer extends EventEmitter {

  public readonly onSynchronized = this.registerEvent<(e: OnServerSynchronizedEvent<DemoPlayerInput, BasicDemoPlayerState>) => void>();
  private players: Array<Entity<BasicDemoPlayerState>> = [];
  private playerMovementInfos: PlayerMovementInfo[] = [];
  private syncer: ServerEntitySyncer<DemoPlayerInput, BasicDemoPlayerState>;
  private stateAssigner: StateAssigner<BasicDemoPlayerState>;
  private inputApplicator: InputApplicator<DemoPlayerInput, BasicDemoPlayerState>;
  private syncerRunner: ServerEntitySyncerRunner<DemoPlayerInput, BasicDemoPlayerState>;

  public constructor(newEntityStateAssigner: StateAssigner<BasicDemoPlayerState>, inputApplicator: InputApplicator<DemoPlayerInput, BasicDemoPlayerState>) {
    super();
    this.stateAssigner = newEntityStateAssigner;
    this.inputApplicator = inputApplicator;

    this.syncer = new ServerEntitySyncer({
      inputApplicator: this.inputApplicator as InputApplicator<DemoPlayerInput, BasicDemoPlayerState>,
      inputValidator: (entity: Entity<BasicDemoPlayerState>, input: DemoPlayerInput) => this.validateInput(entity, input),
      clientIdAssigner: () => this.getIdForNewClient(),
    });

    this.syncerRunner = new ServerEntitySyncerRunner(this.syncer);
    this.syncerRunner.onSynchronized((e) => this.emit(this.onSynchronized, e));

  }

  public addClient(connection: TwoWayMessageBuffer<InputMessage<DemoPlayerInput>, StateMessage<BasicDemoPlayerState>>): string {
    const clientId = this.syncer.connectClient(connection);
    const newEntityid = clientId;

    const newPlayer: Entity<BasicDemoPlayerState> = { id: clientId, state: this.stateAssigner(newEntityid) };
    this.players.push(newPlayer);
    this.syncer.addPlayerEntity(newPlayer, clientId);
    this.playerMovementInfos.push({
      entityId: newPlayer.id,
      lastInputTimestamp: new Date().getTime(),
      pressTimeDuringLastInput: 0,
      totalPressTimeInLast10Ms: 0,
    });

    return clientId;
  }

  public start(updateRateHz: number) {
    this.syncerRunner.start(updateRateHz);
  }

  public stop() {
    this.syncerRunner.stop();
  }

  private getIdForNewClient(): string {
    return `c${this.players.length}`;
  }

  private validateInput(entity: Entity<BasicDemoPlayerState>, input: DemoPlayerInput) {
    if ((input as DemoPlayerInput).pressTime != null) {
      const demoPlayerInput = input as DemoPlayerInput;
      const player = this.playerMovementInfos.find((info: PlayerMovementInfo) => {
        return info.entityId === entity.id;
      });
      if (player != null && demoPlayerInput.pressTime != null) {
        return player.lastInputTimestamp + demoPlayerInput.pressTime <= new Date().getTime();
      }
    }
    return false;
  }
}
