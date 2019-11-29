import React from 'react';
import { LcDemoClient } from '../../lag-compensation-demo/lc-demo-client';
import { LcDemoGameState } from '../../lag-compensation-demo/lc-demo-game-state';
import { RendererFrame } from '../common/renderer-frame.component';
import { LcDemoGameRendererComponent } from './lc-demo-game-renderer.component';

interface LcDemoClientRendererProps {
  title: JSX.Element;
  borderColor: string;
  client: LcDemoClient;
}

interface LcDemoClientRendererState {
  gameState: LcDemoGameState | undefined;
  numberOfPendingInputs: number | undefined;
}

export class LcDemoClientRenderer extends React.Component<LcDemoClientRendererProps, LcDemoClientRendererState> {

  constructor(props: LcDemoClientRendererProps) {
    super(props);

    this.state = {
      gameState: undefined,
      numberOfPendingInputs: undefined,
    };

    props.client.onUpdated((gameState: LcDemoGameState) => {
      this.setState({
        gameState,
      });
    });
  }

  public render() {
    const game = this.state.gameState;
    if (game == null) return null;
    return (
      <RendererFrame borderColor={this.props.borderColor} >
        {this.props.title}
        <LcDemoGameRendererComponent game={game} />
        {game.players
          .map(({ id, player }) => <p key={id}>{`${id}: YPos: ${player.yOffset}, Rotation: ${player.rotationRads.toFixed(2)}`}</p>)}
      </RendererFrame>
    );
  }
}
