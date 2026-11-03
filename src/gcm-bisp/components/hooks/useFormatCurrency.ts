export const useFormatCurrency = () => {
  const formatCurrency = (value: number | string): string => {
    if (value === null || value === undefined || value === "") return "L 0.00";

    const numberValue = Number(value);

    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  };

  return { formatCurrency };
};