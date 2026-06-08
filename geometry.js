// Geometry utility functions for Minecraft Wall Designer

function getPoles(wallBlocks, numPoles) {
  if (wallBlocks.length === 0 || numPoles < 2) return [];
  const poles = [];
  for (let i = 0; i < numPoles; i++) {
    const idx = Math.round((i * (wallBlocks.length - 1)) / (numPoles - 1));
    poles.push(wallBlocks[idx]);
  }
  return poles;
}

function getLineCoords(x0, y0, x1, y1) {
  const coords = [];
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    coords.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return coords;
}

function getMidpointCircleCoords(cx, cy, r) {
  const coords = [];
  let x = r, y = 0, d = 1 - r;
  while (x >= y) {
    coords.push([cx + x, cy + y]);
    coords.push([cx + y, cy + x]);
    coords.push([cx - y, cy + x]);
    coords.push([cx - x, cy + y]);
    coords.push([cx - x, cy - y]);
    coords.push([cx - y, cy - x]);
    coords.push([cx + y, cy - x]);
    coords.push([cx + x, cy - y]);
    y++;
    if (d < 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
  }
  const unique = {};
  coords.forEach(([x, y]) => { unique[x + ',' + y] = [x, y]; });
  return Object.values(unique).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function getCirclePoles(circleCoords, cx, cy, numPoles, startAngleDeg = 0) {
  if (circleCoords.length === 0 || numPoles < 2) return [];
  const points = circleCoords.map(([x, y]) => {
    const angle = Math.atan2(y - cy, x - cx);
    return { x, y, angle };
  });
  points.sort((a, b) => a.angle - b.angle);
  const poles = [];
  for (let i = 0; i < numPoles; i++) {
    const targetAngle = ((startAngleDeg * Math.PI / 180) + i * 2 * Math.PI / numPoles);
    let minDiff = Infinity, best = null;
    for (const pt of points) {
      let diff = Math.abs(((pt.angle - targetAngle + Math.PI * 2) % (Math.PI * 2)));
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < minDiff) {
        minDiff = diff;
        best = pt;
      }
    }
    if (best) poles.push([best.x, best.y]);
  }
  return poles;
}

function getRectangleCoords(x0, y0, x1, y1) {
  const coords = [];
  for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) coords.push([x, Math.min(y0, y1)]);
  for (let y = Math.min(y0, y1) + 1; y <= Math.max(y0, y1); y++) coords.push([Math.max(x0, x1), y]);
  for (let x = Math.max(x0, x1) - 1; x >= Math.min(x0, x1); x--) coords.push([x, Math.max(y0, y1)]);
  for (let y = Math.max(y0, y1) - 1; y > Math.min(y0, y1); y--) coords.push([Math.min(x0, x1), y]);
  return coords;
}
