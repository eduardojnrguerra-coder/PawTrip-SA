export function calculateDeliveryFee(subtotal: number) {
  if (subtotal <= 0) return 0;
  return 89;
}

export function formatZar(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}
