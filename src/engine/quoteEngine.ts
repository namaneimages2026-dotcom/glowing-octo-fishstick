export function quoteTotal(qty: number, materialCost: number, machineMinutes: number, setupFee: number, margin: number) {
  const machine = (machineMinutes / 60) * 350;
  const labour = Math.max(150, machineMinutes * 3.5);
  const subtotal = materialCost + machine + labour + setupFee;
  return Math.max(250, Math.round(subtotal * (1 + margin / 100)));
}
