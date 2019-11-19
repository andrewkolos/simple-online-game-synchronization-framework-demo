import { TwoWayMessageBuffer, InputMessage, StateMessage, Entity, ServerEntitySyncer, ServerEntitySyncerRunner, ClientInfo, InputApplicator, NumericObject } from '@akolos/ts-client-server-game-synchronization';
import { EventEmitter } from 'typed-event-emitter';

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

export class DemoSyncServer<PlayerState extends NumericObject> extends EventEmitter {

  public readonly onSynchronized = this.registerEvent<(entities: ReadonlyArray<Entity<PlayerState>>) => void>();
  private players: Array<Entity<PlayerState>> = [];
  private playerMovementInfos: PlayerMovementInfo[] = [];
  private syncer: ServerEntitySyncer<DemoPlayerInput, PlayerState>;
  private stateAssigner: StateAssigner<PlayerState>;
  private inputApplicator: InputApplicator<DemoPlayerInput, PlayerState>;
  private syncerRunner: ServerEntitySyncerRunner<DemoPlayerInput, PlayerState>;

  public constructor(newEntityStateAssigner: StateAssigner<PlayerState>, inputApplicator: InputApplicator<DemoPlayerInput, PlayerState>) {
    super();
    this.stateAssigner = newEntityStateAssigner;
    this.inputApplicator = inputApplicator;

    this.syncer = new ServerEntitySyncer({
      clientIdAssigner: () => this.getIdForNewClient(),
      inputApplicator: this.inputApplicator as InputApplicator<DemoPlayerInput, PlayerState>,
      inputValidator: (entity: Entity<PlayerState>, input: DemoPlayerInput) => this.validateInput(entity, input),
    });

    this.syncerRunner = new ServerEntitySyncerRunner(this.syncer);
    this.syncerRunner.onSynchronized((entities: ReadonlyArray<Entity<PlayerState>>) => this.emit(this.onSynchronized, entities));

  }

  public addClient(connection: TwoWayMessageBuffer<InputMessage<DemoPlayerInput>, StateMessage<PlayerState>>): string {
    const clientId = this.syncer.connectClient(connection);
    const newEntityid = clientId;

    const newPlayer: Entity<PlayerState> = { id: clientId, state: this.stateAssigner(newEntityid) };
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

  public getClientInformation(): ReadonlyMap<string, ClientInfo<DemoPlayerInput, PlayerState>>;
  public getClientInformation(clientId: string): ClientInfo<DemoPlayerInput, PlayerState>;
  public getClientInformation(clientId?: string) {
    return clientId == null ? this.syncer.getClientInformation() : this.syncer.getClientInformation(clientId);
  }

  private getIdForNewClient(): string {
    return `c${this.players.length}`;
  }

  private validateInput(entity: Entity<PlayerState>, input: DemoPlayerInput) {
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
