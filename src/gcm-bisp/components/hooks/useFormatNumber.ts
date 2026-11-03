export const useFormatNumber = () => {
  const formatNumber = (value: number | string, decimals: number = 2): string => {
    if (value === null || value === undefined || value === "") return (0).toFixed(decimals);

    const numberValue = Number(value);

    return new Intl.NumberFormat("es-HN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numberValue);
  };

  return { formatNumber };
};
