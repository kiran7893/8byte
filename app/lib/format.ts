export const formatCurrency = (value: number | null): string => {
  if (value === null) {
    return "—";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    notation: "standard"
  }).format(value);
};

export const formatNumber = (value: number | null): string => {
  if (value === null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercent = (value: number | null): string => {
  if (value === null) {
    return "—";
  }
  return `${value.toFixed(2)}%`;
};

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};
