/**
 * @author Don (dl90)
 * @date March 15, 2020
 * @note Basic pathfinding with AStar
 * @TODO Need to resolve infinite loop issue, caused by getLowestCost alternating between two neighboring cells, currently handled by throwing error
 */

const [blocked, movable] = [0, 1];
// for manually testing
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
 * @param {Object} end node containing end x, y coords (used to calculate distanceToEnd)
 * @return {Array} array of neighboring nodes, contains x, y coords and costs
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
  };
  const results = [];

  let [row, column] = [0, 0];
  if (map !== undefined && map[0] !== undefined) {
    row = map.length;
    column = map[0].length;
  }

  for (const direction in directions) {
    const [x, y] = [
      node.x + directions[direction].x,
      node.y + directions[direction].y
    ];
    if (y >= 0 && y < row && x >= 0 && x < column) {
      try {
        if (map[y][x] !== undefined && map[y][x] !== blocked) {
          const newNode = new Object();
          [newNode.x, newNode.y] = [x, y];
          if (
            Math.abs(newNode.x - node.x) + Math.abs(newNode.y - node.y) ===
            2
          ) {
            newNode.moveCost = diagonalMove;
          } else {
            newNode.moveCost = straightMove;
          }
          newNode.distanceToEnd = Math.sqrt(
            (end.x - x) ** 2 + (end.y - y) ** 2
          );
          newNode.cost = newNode.moveCost + newNode.distanceToEnd;
          results.push(newNode);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
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

  // finds lowest heuristic (distanceToEnd) cost from all moves
  for (let i = 0; i < array.length; i++) {
    if (array[i].distanceToEnd < current.distanceToEnd) {
      current = array[i];
    }
  }

  // finds similar cost moves
  sameCost.push(current);
  for (let i = 0; i < array.length; i++) {
    if (array[i] != current && array[i].cost === current.cost) {
      sameCost.push(array[i]);
    }
  }

  // throws error if no moves possible
  if (sameCost[0] === undefined) {
    throw new Error("No possible moves");
  }

  // finds lowest cost (distanceToEnd + moveCost) from sameCost[]
  let cost = sameCost[0];
  for (let i = 0; i < sameCost.length; i++) {
    if (sameCost[i].cost < cost.cost) {
      cost = sameCost[i];
    }
  }
  return cost; // loops
}

/**
 * Generates shortest path
 * @param {Object} start node containing start x, y coords
 * @param {Object} end node containing end x, y coords
 * @param {Array} map 2D map (map[y][x] => row = x, column = y)
 * @return {Array} array of nodes generating the shortest path (hopefully)
 */
function run(start, end, map) {
  const pathEvaluated = [];
  let pathToEvaluate = [];
  let [state, current, totalMoveCost] = [true, start, 0];

  current.moveCost = 0;
  current.distanceToEnd = Math.sqrt(
    (end.x - start.x) ** 2 + (end.y - start.y) ** 2
  );
  current.cost = 0;
  pathToEvaluate.push(current);

  while (state) {
    totalMoveCost += current.moveCost;
    const nodes = genNeighbors(current, end, map);
    for (const node of nodes) {
      let exist = false;

      // for some reason Array.includes does not work
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
      }
    }

    pathToEvaluate = pathToEvaluate.filter(node => {
      return node !== current;
    });
    pathEvaluated.push(current);
    console.info(`\tLOG: current =>  ${JSON.stringify(current)}`);
    console.info(
      `\nLOG: ${pathToEvaluate.length} paths to evaluate =>  ${JSON.stringify(
        pathToEvaluate
      )}\n`
    );
    current = getLowestCost(nodes); // loops

    pathEvaluated.forEach(evaluatedNode => {
      if (evaluatedNode.x === current.x && evaluatedNode.y === current.y) {
        throw new Error("Infinite loop");
      }
    });

    if (current.x === start.x && current.y === start.y) {
      throw new Error("Reverted back to start");
    }

    if (current.x === end.x && current.y === end.y) {
      pathEvaluated.push(current);
      state = false;
      console.info(`\n\tReached the end: ${JSON.stringify(current)}`);
      console.info(`\n\tTotal move cost: ${totalMoveCost}`);
    }

    if (pathToEvaluate.length === 0) {
      throw new Error("Not possible to reach end");
    }
  }
  return pathEvaluated;
}

module.exports = { run };
