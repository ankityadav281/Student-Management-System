export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const getGradeBadgeColor = (grade) => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'badge-active';
    case 'B+':
    case 'B':
      return 'badge-graduated';
    case 'C':
    case 'D':
      return 'badge-late';
    default:
      return 'badge-absent';
  }
};
