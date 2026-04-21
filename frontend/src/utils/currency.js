/**
 * Format number to Indonesian Rupiah format without decimals
 * @param {number} amount - Amount to format
 * @returns {string} Formatted string like "5.000.000"
 */
export const formatRupiah = (amount) => {
  const absAmount = Math.abs(Math.round(amount));
  return absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Format number to Indonesian Rupiah with "Rp" prefix
 * @param {number} amount - Amount to format
 * @returns {string} Formatted string like "Rp 5.000.000"
 */
export const formatCurrency = (amount) => {
  return `Rp ${formatRupiah(amount)}`;
};
