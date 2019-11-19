import React from 'react';
import { DemoGameRendererComponent } from './game-renderer';
import { DemoClientEntitySyncerRunner } from './demo-client-runner';
import { BasicDemoPlayerState } from '../../basic-demo-implementation/player';
import { Entity } from '@akolos/ts-client-server-game-synchronization';
import { createPositionParagraphTags } from './create-position-paragraph-tags';

interface ClientRendererProps {
  demoClientRunner: DemoClientEntitySyncerRunner;
  borderColor: string;
  title: JSX.Element;
}

interface ClientRendererState {
  entities: Array<Entity<BasicDemoPlayerState>>;
  numberOfPendingInputs: number;
}

export class ClientRenderer extends React.Component<ClientRendererProps, ClientRendererState> {

  constructor(props: ClientRendererProps) {
    super(props);

    this.state = {
      entities: [],
      numberOfPendingInputs: 0,
    };

    props.demoClientRunner.onSynchronized((entities: Array<Entity<BasicDemoPlayerState>>) => {
      this.setState({
        entities,
        numberOfPendingInputs: props.demoClientRunner.synchronizer.getNumberOfPendingInputs(),
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
        {this.props.title}
        <DemoGameRendererComponent entities={this.state.entities} />
        {createPositionParagraphTags(this.state.entities)}
        <p>{`Non-acknowledged inputs: ${this.state.numberOfPendingInputs}`}</p>
      </div>
    );
  }
}
