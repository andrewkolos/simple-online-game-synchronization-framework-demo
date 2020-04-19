import React from 'react';
import { DemoGameRenderer } from './basic-demo-game-renderer';
import { BasicDemoPlayerState, BasicDemoPlayerInput } from '../../basic-demo-implementation/player';
import { Entity, OnServerSynchronizedEvent } from '@akolos/ts-client-server-game-synchronization';
import { createPositionParagraphTags } from './create-position-paragraph-tags';
import { DemoSyncServer } from '../../basic-demo-implementation/demo-server';
import { RendererFrame } from '../common/renderer-frame.component';

interface ServerRendererProps {
  demoSyncServer: DemoSyncServer;
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
    props.demoSyncServer.onSynchronized((ev: OnServerSynchronizedEvent<BasicDemoPlayerInput, BasicDemoPlayerState>) => {
      this.setState({
        entities: ev.getEntities().asArray(),
        lastAckSeqNumbers: [...ev.getLastAckInputSeqNumbers().entries()].map((e: [string, number]) => ({
          clientId: e[0],
          lastAckSeqNumber: e[1],
        })),
      });
    });
  }

  public render() {

    return (
      <RendererFrame borderColor={this.props.borderColor}>
        <p>Server View</p>
        <DemoGameRenderer entities={this.state.entities} />
        {createPositionParagraphTags(this.state.entities)}
        <p>
          Last acknowledged inputs:&nbsp;
          {this.state.lastAckSeqNumbers.map(({ clientId, lastAckSeqNumber }) => `${clientId}: ${lastAckSeqNumber} `)}
        </p>
      </RendererFrame>
    );
  }
}
