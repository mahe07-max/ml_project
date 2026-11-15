const wholeRupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const rupeesAndPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return '—';
  }

  return (Number.isInteger(amount) ? wholeRupees : rupeesAndPaise).format(amount);
}
