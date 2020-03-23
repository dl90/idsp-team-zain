const { genEmpty } = require("./mapgen");

describe("genEmpty(map) test", () => {
  const [y, x, val] = [2, 4, 0];
  const map = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  const result = genEmpty(y, x, val);

  test("Correctly generates a 2D array with specified columns(x) and rows(y) (arr[y][x]", () => {
    expect(result).toEqual(expect.arrayContaining(map));
  });
  test("Y-axis (number of rows) to be correct", () => {
    expect(result[y]).toBeUndefined();
    expect(result[y - 1]).toBeDefined();
  });
  test("X-axis (number of columns) to be correct", () => {
    expect(result[y - 1][x]).toBeUndefined();
    expect(result[y - 1][x - 1]).toBe(val);
  });
  test("Start and end positions", () => {
    expect(result[y - 1][x - 1]).toBe(val);
    expect(result[y - y][x - x]).toBe(val);
  });
  test("Bad arguments", () => {
    expect(() => genEmpty(1, "", 1)).toThrow("Invalid input");
    expect(() => genEmpty("", 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(undefined, 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(1, undefined, 1)).toThrow("Invalid input");
    expect(() => genEmpty(null, 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(1, null, 1)).toThrow("Invalid input");
    expect(() => genEmpty(Infinity, 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(1, Infinity, 1)).toThrow("Invalid input");
    expect(() => genEmpty(-10, 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(1, -10, 1)).toThrow("Invalid input");
    expect(() => genEmpty(0, 1, 1)).toThrow("Invalid input");
    expect(() => genEmpty(1, 0, 1)).toThrow("Invalid input");
  });
});
