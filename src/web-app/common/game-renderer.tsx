import React, { RefObject } from 'react';
import { Entity } from '@akolos/ts-client-server-game-synchronization';
import { BasicDemoPlayerState, DemoPlayer } from '../../basic-demo-implementation/player';

interface DemoGameRendererProps {
  entities: Array<Entity<BasicDemoPlayerState>>;
};

export class DemoGameRendererComponent extends React.Component<DemoGameRendererProps> {

  private canvasRef: RefObject<HTMLCanvasElement>;

  constructor(props: DemoGameRendererProps) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
  }

  public componentWillReceiveProps(props: DemoGameRendererProps) {
    const canvas = this.canvasRef.current;
    if (canvas == null) return;

    canvas.width = canvas.width; // Clears canvas.
    const ctx = canvas.getContext('2d');
    if (ctx == null) throw Error('Canvas context is undefined');

    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, 1000, 1000);
    const colors = {
      c0: 'blue',
      c1: 'red',
    };

    props.entities.forEach((entity: DemoPlayer) => {
      const entityRadius = canvas.height * 0.9 / 2;
      const entityPosition = entity.state.position;

      ctx.beginPath();
      ctx.arc(entityPosition, canvas.height / 2, entityRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = (colors as any)[entity.id];
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'dark' + (colors as any)[entity.id];
      ctx.stroke();
    });
  }

  public render() {
    return (
      <canvas width='920' height='75' ref={this.canvasRef}></canvas>
    );
  }
}
