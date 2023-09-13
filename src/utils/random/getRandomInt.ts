export function getRandomInt(_min: number, _max: number, random = Math.random) {
  const min = Math.ceil(_min);
  const max = Math.floor(_max);
  return Math.floor(random() * (max - min + 1)) + min;
}
