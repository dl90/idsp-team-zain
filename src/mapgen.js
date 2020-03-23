/**
 * @author Don (dl90)
 * @date March 21, 2020
 * @note Generate tile map
 */
const { run } = require("./pathfinding");
const performance = require("perf_hooks");

// map settings
const [row, column] = [30, 20];
const [blocked, movable] = [0, 1];

// positions
const start = { x: 0, y: 0 };
const end = { x: column - 1, y: row - 1 };

// obstacles
const difficulty = 0.3;
const numOfBlocked = Math.round(row * column * difficulty);

const test = main();
if (Array.isArray(test)) {
  const length = test.length;
  console.info(`\n\t${length} Nodes traversed: \n\n`, test);
} else {
  console.log(test);
}

function main() {
  const runtime_start = performance.performance.now();
  const map = genEmpty(row, column, movable);
  const mapWithObstacles = genObstacles(map, numOfBlocked, blocked);
  console.info(mapWithObstacles);

  try {
    const route = run(start, end, mapWithObstacles);
    const runtime_end = performance.performance.now();
    console.info(`\n\tRuntime: \t${runtime_end - runtime_start} ms`);
    return route;
  } catch (err) {
    return err.message;
  }
}

/**
 * Generates 2D array populated with value
 * @param {Number} row Number of rows (y-axis)
 * @param {Number} column Number of columns (x-axis)
 * @param {Any} value Value inserted to each cell
 * @return 2D array
 */
function genEmpty(row, column, value) {
  if (!row || row === Infinity || typeof row !== "number" || row < 1) {
    throw new Error("Invalid input");
  }
  if (
    !column ||
    column === Infinity ||
    typeof column !== "number" ||
    column < 1
  ) {
    throw new Error("Invalid input");
  }
  const map = [];
  for (let i = 0; i < row; i++) {
    map.push([]);
    for (let j = 0; j < column; j++) {
      map[i].push(value);
    }
  }
  return map;
}

/**
 * Inserts obstacles randomly in the map
 * @param {Array} map 2D array representing map
 * @param {Number} numOfObstacles Number of obstacles to add to map
 * @param {Number} value Number representing an obstacle
 */
function genObstacles(map, numOfObstacles, value) {
  const seed = [];
  let i = 0;

  while (i <= numOfObstacles) {
    // excludes start and end [0][0], [y-1][x-1]
    const y = String(Math.round(Math.random() * (row - 2) + 1));
    const x = String(Math.round(Math.random() * (column - 2) + 1));
    if (!seed.includes(`${x} ${y}`)) {
      seed.push(`${x} ${y}`);
      i++;
    }
  }

  seed.forEach(val => {
    let [x, y] = val.split(" ");
    x = parseInt(x);
    y = parseInt(y);
    map[y][x] = value;
  });

  return map;
}

module.exports = { genEmpty, genObstacles };
