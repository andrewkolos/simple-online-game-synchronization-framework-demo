import { Point } from '../../lag-compensation-demo/misc/geomtry';

export function lineSegments(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
}

export function lineSegment(ctx: CanvasRenderingContext2D, p: Point, q: Point) {
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
}
