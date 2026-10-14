const numberFormat = new Intl.NumberFormat('en', { notation: 'compact' });

export function formatCount(n) {
  return numberFormat.format(n ?? 0);
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
