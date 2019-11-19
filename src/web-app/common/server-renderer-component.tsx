import React from 'react';
import { DemoGameRendererComponent } from './game-renderer';
import { BasicDemoPlayerState, BasicDemoPlayerInput } from '../../basic-demo-implementation/player';
import { Entity, ClientInfo } from '@akolos/ts-client-server-game-synchronization';
import { createPositionParagraphTags } from './create-position-paragraph-tags';
import { DemoSyncServer } from '../../common/demo-server';

interface ServerRendererProps {
  demoSyncServer: DemoSyncServer<BasicDemoPlayerState>;
  borderColor: string;
}

interface ServerRendererState {
  lastAckSeqNumbers: Array<{ clientId: string, lastAckSeqNumber: number }>;
  entities: Array<Entity<BasicDemoPlayerState>>;
}

export class ServerRenderer extends React.Component<ServerRendererProps, ServerRendererState> {

  constructor(props: ServerRendererProps) {
    super(props);

    this.state = {
      lastAckSeqNumbers: [],
      entities: [],
    };

    props.demoSyncServer.onSynchronized((entities: Array<Entity<BasicDemoPlayerState>>) => {
      const clientInfo = Array.from(this.props.demoSyncServer.getClientInformation().values());
      this.setState({
        entities,
        lastAckSeqNumbers: clientInfo.map((client: ClientInfo<BasicDemoPlayerInput, BasicDemoPlayerState>) => ({
          clientId: client.id,
          lastAckSeqNumber: client.seqNumberOfLastProcessedInput,
        })),
      });
    });
  }

  public render() {
    const outerStyle = {
      border: `5px solid ${this.props.borderColor}`,
      padding: '15px',
      margin: '15px',
    };

    return (
      <div style={outerStyle}>
        <p>Server View</p>
        <DemoGameRendererComponent entities={this.state.entities} />
        {createPositionParagraphTags(this.state.entities)}
        <p>
          Last acknowledged inputs:&nbsp;
          {this.state.lastAckSeqNumbers.map(({ clientId, lastAckSeqNumber }) => `${clientId}: ${lastAckSeqNumber} `)}
        </p>
      </div>
    );
  }
}
