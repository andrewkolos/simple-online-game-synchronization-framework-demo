import React from 'react';
import { InMemoryClientServerNetwork, InputMessage, StateMessage, ClientEntitySyncerRunner, PlayerClientEntitySyncer } from '@akolos/ts-client-server-game-synchronization';
import { BasicDemoPlayerInput, BasicDemoPlayerState, demoPlayerInputApplicator } from '../../basic-demo-implementation/player';
import { createKeyboardBasicDemoInputCollector, KeyboardDemoinputCollectorKeycodes } from '../../basic-demo-implementation/keyboard-demo-input-collector';
import { ClientRenderer } from '../common/client-renderer-component';
import { ServerRenderer } from '../common/server-renderer-component';
import { DemoSyncServer } from '../../common/demo-server';

const SERVER_SYNC_UPDATE_RATE = 60;
const CLIENT_UPDATE_RATE = 60;
const CLIENT_LATENCY_MS = 100;

export class BasicDemo extends React.Component {

  private readonly server: DemoSyncServer<BasicDemoPlayerState>;
  private readonly clients: Array<ClientEntitySyncerRunner<BasicDemoPlayerState, BasicDemoPlayerInput>>;

  public constructor(props: {}) {
    super(props);

    const demoServer = new DemoSyncServer<BasicDemoPlayerState>((_entityId: string) => ({position: 0}), demoPlayerInputApplicator);
    const network = new InMemoryClientServerNetwork<InputMessage<BasicDemoPlayerInput>, StateMessage<BasicDemoPlayerState>>();

    demoServer.addClient(network.getNewClientConnection());
    demoServer.addClient(network.getNewClientConnection());

    const client1Runner = new ClientEntitySyncerRunner(createClient({ moveLeft: 65, moveRight: 68 }, network));
    const client2Runner = new ClientEntitySyncerRunner(createClient({ moveLeft: 37, moveRight: 39 }, network));

    demoServer.start(SERVER_SYNC_UPDATE_RATE);
    client1Runner.start(CLIENT_UPDATE_RATE);
    client2Runner.start(CLIENT_UPDATE_RATE);

    this.server = demoServer;
    this.clients = [client1Runner, client2Runner];
  }

  public componentWillUnmount() {
    this.server.stop();
    this.clients.forEach((c) => c.stop());
  }

  public render() {

    return (
      <div>
        <ClientRenderer borderColor='blue' title={<p>Player One's view. Move with A and D keys</p>}
          demoClientRunner={this.clients[0]} />
        <ServerRenderer borderColor='gray' demoSyncServer={this.server} />
        <ClientRenderer borderColor='red' title={<p>Player Two's view. Move with arrow keys</p>} demoClientRunner={this.clients[1]} />
      </div>
    );
  }
}

function createClient(keyMappings: KeyboardDemoinputCollectorKeycodes,
  network: InMemoryClientServerNetwork<InputMessage<BasicDemoPlayerInput>, StateMessage<BasicDemoPlayerState>>) {

  const inputCollector = createKeyboardBasicDemoInputCollector(keyMappings);

  const client = new PlayerClientEntitySyncer({
    connection: network.getNewConnectionToServer(CLIENT_LATENCY_MS),
    localPlayerInputStrategy: {
      inputApplicator: demoPlayerInputApplicator,
      inputSource: inputCollector,
    },
    serverUpdateRateHz: SERVER_SYNC_UPDATE_RATE,
  });

  return client;
}
