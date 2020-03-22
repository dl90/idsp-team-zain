/**
 * @author Don (dl90)
 * @date March 15, 2020
 * @note Basic pathfinding with AStar
 * @TODO Need to favor diagonal move over 2 straight moves when factoring cost.
*/

const [blocked, movable] = [0, 1];
const gameMap = [
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];


/**
 * Generates neighbors
 * @param {Object} node node containing starting x, y coords
 * @return {Array} array of nodes, contains x, y coords and cost
 */
function genNeighbors(node, end, map) {
  const [straightMove, diagonalMove] = [1, Math.sqrt(2)];
  const directions = {
    north: { x: 0, y: -1 },
    northEast: { x: 1, y: -1 },
    east: { x: 1, y: 0 },
    southEast: { x: 1, y: 1 },
    south: { x: 0, y: 1 },
    southWest: { x: -1, y: -1 },
    west: { x: -1, y: 0 },
    northWest: { x: -1, y: -1 }
  }
  const results = [];

  let [row, column] = [0, 0];
  if (map !== undefined && map[0] !== undefined) {
    row = map.length;
    column = map[0].length;
  };

  for (const direction in directions) {
    const [x, y] = [node.x + directions[direction].x, node.y + directions[direction].y];
    if ((y >= 0 && y < row) && (x >= 0 && x < column)) {
      try {
        if (map[y][x] !== undefined && map[y][x] !== blocked) {
          let node = new Object;
          if (Math.abs(x) + Math.abs(y) === 2) {
            node.moveCost = diagonalMove;
          } else {
            node.moveCost = straightMove;
          }
          const distanceToEnd = Math.sqrt((end.x - x) ** 2 + (end.y - y) ** 2);
          [node.x, node.y, node.distanceToEnd] = [x, y, distanceToEnd];
          node.cost = node.moveCost + node.distanceToEnd;
          results.push(node);
        };
      } catch { };
    };
  };
  return results;
}


/**
 * get the lowest cost node
 * @param {Array} array array of nodes
 * @return {Object} node with the lowest cost
 */
function getLowestCost(array) {
  let current = array[0];
  const sameCost = [];

  // finds lowest cost move
  for (let i = 0; i < array.length; i++) {
    if (array[i].cost < current.cost) {
      current = array[i];
    }
  }

  // finds similar cost moves
  sameCost.push(current);
  for (let i = 0; i < array.length; i++) {
    if (array[i] != current && array[i].cost === current.cost) {
      sameCost.push(array[i])
    }
  }

  // throws error if no moves possible
  if (sameCost[0] === undefined) {
    throw new Error("No possible moves");
  }

  // finds lowest heuristic (distanceToEnd) from sameCost[]
  let cost = sameCost[0];
  for (let i = 0; i < sameCost.length; i++) {
    if (sameCost[i].distanceToEnd < cost.distanceToEnd) {
      cost = sameCost[i];
    }
  }
  return cost;
}


/**
 * Generates shortest path 
 * @param {Object} start node containing start x, y coords
 * @param {Object} end node containing end x, y coords
 * @return {Array} array of nodes generating the shortest path (hopefully)
 */
function run(start, end, map) {
  const pathEvaluated = [];
  let pathToEvaluate = [];
  let [state, current] = [true, start];

  current.cost = 0;
  pathToEvaluate.push(current);

  while (state) {
    const nodes = genNeighbors(current, end, map);
    for (const node of nodes) {
      let exist = false;

      pathEvaluated.forEach(evaluatedNode => {
        if (evaluatedNode.x === node.x && evaluatedNode.y === node.y) {
          exist = true;
        }
      });
      pathToEvaluate.forEach(nodeToEval => {
        if (nodeToEval.x === node.x && nodeToEval.y === node.y) {
          exist = true;
        }
      });

      if (!exist) {
        pathToEvaluate.push(node);
      };
    }

    pathToEvaluate = pathToEvaluate.filter((x) => { return x !== current });
    pathEvaluated.push(current);
    current = getLowestCost(nodes);

    if (current.x === start.x && current.y === start.y) {
      state = false;
    };

    if (current.x === end.x && current.y === end.y) {
      pathEvaluated.push(current);
      state = false;
    };

    if (pathEvaluated.includes(current)) {
      state = false;
    };

    if (pathToEvaluate.length === 0) {
      state = false;
      throw new Error("Not possible to reach end");
    };
  }
  return pathEvaluated;
}

module.exports = { run }