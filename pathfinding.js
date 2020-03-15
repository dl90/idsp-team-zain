/**
 * @author Don (dl90)
 * @date March 15, 2020
 * @note Basic pathfinding with AStar
*/

const [row, column] = [20, 20];
const start = { x: 0, y: 0 };
const end = { x: column - 1, y: row - 1 };
const [straightMove, diagonalMove] = [1, Math.sqrt(2)];
const [blocked, movable] = [0, 1];

// 0 == blocked, 1 == movable
const gameMap = [
  ["NW", "N", "NE", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ["W", "X", "E", 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  ["SW", "S", "SE", 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, "O"]
];

function checkDirections() {
  // x y inverted => gameMap   *** [y][x] >>> ([row][column]) ***
  console.log(gameMap[1][1]); // start
  console.log(gameMap[0][1]); // north     => -1,  0
  console.log(gameMap[0][2]); // northEast => -1, +1
  console.log(gameMap[1][2]); // east      =>  0, +1
  console.log(gameMap[2][2]); // southEast => +1, +1
  console.log(gameMap[2][1]); // south     => +1,  0
  console.log(gameMap[2][0]); // southWest => +1, -1
  console.log(gameMap[1][0]); // west      =>  0, -1
  console.log(gameMap[0][0]); // northWest => -1, -1
}

/**
 * @param {Number} moveCost movement cost, aka "G-cost" (straight/diagonal moves)
 * @param {Number} distanceToEnd distance to goal, aka "H-cost"
 * @return heuristic value (sum of "G" and "H"), aka "F-cost"
 */
function findCost(moveCost, distanceToEnd) {
  return moveCost + distanceToEnd;
}

genNeighbor(start);
function genNeighbor(start) {
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

  for (const direction in directions) {
    // console.log(directions[direction]);
    const y = start.y + directions[direction].y;
    const x = start.x + directions[direction].x;

    if ((y >= 0 && y < row) && (x >= 0 && x < column)) {
      try {
        if (gameMap[y][x] !== undefined && gameMap[y][x] !== blocked) {
          let moveCost;
          if (Math.abs(x) + Math.abs(y) === 2) {
            moveCost = diagonalMove;
          } else {
            moveCost = straightMove;
          }
          const distanceToEnd = Math.sqrt((end.x - x) ** 2 + (end.y - y) ** 2);
          const h = (findCost(moveCost, distanceToEnd));
          results.push({ x, y, heuristic: h});
        };
      } catch (err) { };
    }
  }
  console.log(results);
}

const nodesToEvaluate = [];
const nodesEvaluated = [];
const path = [];

// run(start, end);
function run(start, end) {
  nodesToEvaluate.push(start);

  let state = true;
  while (state) {

    if (current === end) {
      state = false;
    }

    if (nodesToEvaluate.length = 0) {
      state = false;
    }

    const current = nodesToEvaluate.pop(); // lowest cost node in list, needs to be sorted
    nodesEvaluated.push(current);

    // for each neighbor of current node
    // if its blocked or is in nodesEvaluated, skip to next neighbor

    // if new path to neighbor is shorter OR neighbor is not in nodesToEvaluate
    // calc cost of neighbor
    // parent of neighbor = current

    // if neighbor not in nodesToEvaluate
    // add neighbor to nodesToEvaluate

  }
}