import React from 'react';
import { DemoGameRendererComponent } from './basic-demo-game-renderer.component';
import { BasicDemoPlayerState, BasicDemoPlayerInput } from '../../basic-demo-implementation/player';
import { Entity, ClientInfo } from '@akolos/ts-client-server-game-synchronization';
import { createPositionParagraphTags } from './create-position-paragraph-tags';
import { DemoSyncServer } from '../../basic-demo-implementation/demo-server';
import { RendererFrame } from '../common/renderer-frame.component';

interface ServerRendererProps {
  demoSyncServer: DemoSyncServer<BasicDemoPlayerState>;
  borderColor: string;
}

interface ServerRendererState {
  entities: Array<Entity<BasicDemoPlayerState>>;
  lastAckSeqNumbers: Array<{clientId: string, lastAckSeqNumber: number}>;
}

export class ServerRenderer extends React.Component<ServerRendererProps, ServerRendererState> {

  constructor(props: ServerRendererProps) {
    super(props);

    this.state = {
      entities: [],
      lastAckSeqNumbers: [],
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

    return (
      <RendererFrame borderColor={this.props.borderColor}>
        <p>Server View</p>
        <DemoGameRendererComponent entities={this.state.entities} />
        {createPositionParagraphTags(this.state.entities)}
        <p>
          Last acknowledged inputs:&nbsp;
          {this.state.lastAckSeqNumbers.map(({ clientId, lastAckSeqNumber }) => `${clientId}: ${lastAckSeqNumber} `)}
        </p>
      </RendererFrame>
    );
  }
}
