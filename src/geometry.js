const Geometry = {
  // Bresenham's Line Algorithm: https://en.wikipedia.org/wiki/Bresenham's_line_algorithm
  // takes a starting point and an end point and returns an array of all the points along the line
  getLine(startX, startY, endX, endY) {
    const points = [];
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = (startX < endX) ? 1 : -1; // directionality
    const sy = (startY < endY) ? 1 : -1;
    let err = dx - dy;
    let e2;

    while (startX != endX && startY != endY) {
      points.push({x: startX, y: startY});
      e2 = err * 2;
      if (e2 > -dx) {
        err -= dy;
        startX += sx;
      }
      if (e2 < dx) {
        err += dx;
        startY += sy;
      }
    }
    points.push({x: startX, y: startY}); // one final push once the while loop ends
    return points;
  }
};

export default Geometry;