import { TwoWayMessageBuffer, InputMessage, StateMessage, Entity, ServerEntitySyncer, ServerEntitySyncerRunner } from '@akolos/ts-client-server-game-synchronization';
import { EventEmitter } from 'typed-event-emitter';
import { BasicDemoPlayerState, demoPlayerInputApplicator, BasicDemoPlayerInput } from './player';

export interface DemoPlayerInput {
  pressTime: number;
}

export class DemoPlayerMovementRecord {
  public readonly lastInputTimestamp: number = new Date().getTime();
  public readonly pressTimeDuringLastInput: number = 0;

  public constructor(init: Partial<DemoPlayerMovementRecord> = {}) {
    this.lastInputTimestamp = init.lastInputTimestamp == null ? new Date().getTime() : init.lastInputTimestamp;
    this.pressTimeDuringLastInput = init.pressTimeDuringLastInput == null ? 0 : init.pressTimeDuringLastInput;
  }
}

export class DemoSyncServer extends EventEmitter {

  public readonly onSynchronized = this.registerEvent<(e: Entity<BasicDemoPlayerState>[]) => void>();
  private playerMovementRecords = new Map<string, DemoPlayerMovementRecord>();
  private syncer: ServerEntitySyncer<DemoPlayerInput, BasicDemoPlayerState>;
  private syncerRunner: ServerEntitySyncerRunner<DemoPlayerInput, BasicDemoPlayerState>;

  public constructor() {
    super();

    this.syncer = new ServerEntitySyncer({
      inputApplicator: this.applyInput.bind(this),
      inputValidator: this.validateInput.bind(this),
      clientIdAssigner: () => this.getIdForNewClient(),
    });

    this.syncerRunner = new ServerEntitySyncerRunner(this.syncer);
    this.syncerRunner.onSynchronized(((e) => this.emit(this.onSynchronized, e)));

  }

  public addClient(connection: TwoWayMessageBuffer<InputMessage<DemoPlayerInput>, StateMessage<BasicDemoPlayerState>>): string {
    const clientId = this.syncer.connectClient(connection);
    const newEntityid = clientId;

    this.playerMovementRecords.set(newEntityid, new DemoPlayerMovementRecord());
    this.syncer.addPlayerEntity({ id: newEntityid, state: { position: 0 } }, clientId);

    return clientId;
  }

  public start(updateRateHz: number) {
    this.syncerRunner.start(updateRateHz);
  }

  public stop() {
    this.syncerRunner.stop();
  }

  private getIdForNewClient(): string {
    return `c${this.playerMovementRecords.size}`;
  }

  private validateInput(entity: Entity<BasicDemoPlayerState>, input: DemoPlayerInput): boolean {
    const demoPlayerInput = input as DemoPlayerInput;
    const movementRecord = this.playerMovementRecords.get(entity.id);

    if (movementRecord != null && demoPlayerInput.pressTime != null) {
      return movementRecord.lastInputTimestamp + demoPlayerInput.pressTime <= new Date().getTime();
    }

    return false;
  }

  private applyInput(playerEntity: Entity<BasicDemoPlayerState>, input: BasicDemoPlayerInput): BasicDemoPlayerState {
    const recordMovementForFutureInputValidation = () => {
      const movementRecord = this.playerMovementRecords.get(playerEntity.id);

      if (movementRecord == null) {
        throw Error(`Player with ID ${playerEntity.id} was not found.`);
      }

      this.playerMovementRecords.set(playerEntity.id, new DemoPlayerMovementRecord({
        pressTimeDuringLastInput: input.pressTime,
      }));
    };

    recordMovementForFutureInputValidation();
    return demoPlayerInputApplicator(playerEntity, input);
  }
}
