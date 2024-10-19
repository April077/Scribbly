type DrawLine = Draw & { color: string; lineWidth: number };
function roundToPixel(point: Point): Point {
  return { x: Math.round(point.x), y: Math.round(point.y) };
}

export function drawLine({ prevPt, currPt, ctx, color }: DrawLine) {
  const lineColor = color;
  let startPt = prevPt ?? currPt;

  // Round coordinates to ensure pixel alignment
  const alignedStartPt = roundToPixel(startPt);
  const alignedCurrPt = roundToPixel(currPt);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.shadowBlur = 1;
  ctx.shadowColor = lineColor;

  ctx.beginPath();
  ctx.moveTo(alignedStartPt.x, alignedStartPt.y);
  ctx.lineTo(alignedCurrPt.x, alignedCurrPt.y);
  ctx.stroke();

  ctx.fillStyle = lineColor;
  ctx.beginPath();
  ctx.arc(alignedStartPt.x, alignedStartPt.y, 2, 0, 2 * Math.PI);
  ctx.fill();
}
