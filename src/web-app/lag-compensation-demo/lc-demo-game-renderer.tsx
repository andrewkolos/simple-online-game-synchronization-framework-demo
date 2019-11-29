import React, { RefObject } from 'react';
import { LcDemoGameState, PlayerId } from '../../lag-compensation-demo/lc-demo-game-state';
import { Point, Polygon } from '../../lag-compensation-demo/misc/geomtry';
import { lineSegment } from '../common/geometry-drawer';
import { LcDemoEntityId } from '../../lag-compensation-demo/lc-demo-entity-ids';

interface DemoGameRendererProps {
  game: LcDemoGameState;
};

export class LcDemoGameRendererComponent extends React.Component<DemoGameRendererProps> {

  private canvasRef: RefObject<HTMLCanvasElement>;

  constructor(props: DemoGameRendererProps) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
  }

  public componentDidMount() {
    const { game } = this.props;
    const canvas = this.canvasRef.current;

    if (canvas == null) return;
    canvas.width = canvas.width; // Clears canvas.
    const ctx = canvas.getContext('2d');
    if (ctx == null) throw Error('Canvas context is undefined');

    const { height: playfieldHeight, width: playfieldWidth } = game.playfield;
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, playfieldHeight, playfieldWidth);

    const playerColors = {
      [LcDemoEntityId.P1]: 'blue',
      [LcDemoEntityId.P2]: 'red',
    };

    const laserColors = {
      [LcDemoEntityId.P1]: 'cyan',
      [LcDemoEntityId.P2]: 'yellow',
    };

    [{ id: PlayerId.P1, player: game.player1 }, { id: PlayerId.P2, player: game.player2 }].forEach((o) => {
      const { id, player } = o;
      const geometry = game.getPlayerGeometry(player, id, game.playfield).asOrderedPolygon();
      const laser = game.getLaser(id).asSegment();

      (function renderPlayer() {
        if (player.timeUntilSpawnMs > 0) {
          ctx.globalAlpha = 0.2;
        }
        ctx.fillStyle = (playerColors as any)[id];
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'dark' + (playerColors as any)[id];
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      })();

      (function renderLaser() {
        if (player.timeUntilSpawnMs === 0) {
          lineSegment(ctx, screenCoords(laser.p), screenCoords(laser.q));
          ctx.lineWidth = 1;
          ctx.strokeStyle = (laserColors as any)[id];
          ctx.stroke();
        }
      })();

      (function renderSpawnTimer() {
        if (player.timeUntilSpawnMs > 0) {
          const pLoc = Polygon.findCenter(geometry);
          const bBox = Polygon.computeBoundingBox(geometry);
          const maxDimension = Math.max(bBox.length, bBox.width);
          const percentTimeUntilSpawn = player.timeUntilSpawnMs / game.respawnTimeMs * 100;

          ctx.lineWidth = 5;

          ctx.beginPath();
          ctx.strokeStyle = 'rgb(221,221,221)';
          ctx.arc(pLoc.x, pLoc.y, maxDimension, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.beginPath();
          ctx.strokeStyle = 'rgb(255, 65, 54)';
          ctx.arc(pLoc.x, pLoc.y, maxDimension, 3 * Math.PI / 2, percentToRad(percentTimeUntilSpawn));
          ctx.stroke();
        }
      })();
    });

    function screenCoords(p: Point): Point;
    function screenCoords(p: Point[]): Point[];
    function screenCoords(p: Point | Point[]) {
      if (Array.isArray(p)) {
        return p.map((pi) => screenCoord(pi, playfieldHeight));
      } else {
        return screenCoord(p, playfieldHeight);
      }
    }
  }

  public render() {
    return (
      <canvas width={this.props.game.playfield.width} height={this.props.game.playfield.height} ref={this.canvasRef}></canvas>
    );
  }

}

function percentToRad(percent: number): number {
  return 3 * Math.PI / 2 + (2 * Math.PI * percent / 100);
}

function screenCoord(p: Point, planeHeight: number): Point {
  return { x: p.x, y: planeHeight - p.y };
}
