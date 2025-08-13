export function generateRate(): number {
  return +(Math.random() * (5 - 4.01) + 4.01).toFixed(2);
}

export function generateCount(): number {
  return Math.floor(Math.random() * (500 - 100 + 1)) + 100;
}
