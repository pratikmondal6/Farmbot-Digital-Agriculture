// Distance function
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Greedy nearest-neighbor TSP
function findShortestPath(points) {
  // Convert x and y to numbers
  points.forEach(p => {
    p.x = parseInt(p.x);
    p.y = parseInt(p.y);
  });

  const visited = new Set();
  const path = [];
  let current = points[0];
  path.push(current);
  visited.add(current._id);

  while (path.length < points.length) {
    let nearest = null;
    let minDist = Infinity;
    for (let point of points) {
      if (!visited.has(point._id)) {
        let dist = distance(current, point);
        if (dist < minDist) {
          minDist = dist;
          nearest = point;
        }
      }
    }
    path.push(nearest);
    visited.add(nearest._id);
    current = nearest;
  }

  return path;
}

module.exports = {
  findShortestPath
}
