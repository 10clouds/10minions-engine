export function getRandomInt(min: number, max: number, random = Math.random) {
  const ceiledMin = Math.ceil(min);
  const flooredMax = Math.floor(max);

  return Math.floor(random() * (flooredMax - ceiledMin + 1)) + ceiledMin;
}
