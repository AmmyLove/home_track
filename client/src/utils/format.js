// src/utils/format.js

// Currency config — symbol and locale for each supported currency
const CURRENCY_CONFIG = {
  NGN: { symbol: "₦", locale: "en-NG" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
};

/**
 * Formats a number as money.
 * e.g. formatMoney(1500000, "NGN") => "₦1,500,000.00"
 * e.g. formatMoney(2999.5, "USD") => "$2,999.50"
 */
export const formatMoney = (amount, currencyCode = "NGN") => {
  const config = CURRENCY_CONFIG[currencyCode] || { symbol: currencyCode, locale: "en-US" };

  // Intl.NumberFormat is built into JavaScript — no extra package needed
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${config.symbol}${formatted}`;
};

/**
 * Returns just the currency symbol for a given code.
 * e.g. currencySymbol("NGN") => "₦"
 */
export const currencySymbol = (code) => {
  return CURRENCY_CONFIG[code]?.symbol ?? code;
};

/**
 * All supported currencies as an array — useful for dropdowns.
 */
export const CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "NGN (₦ Naira)" },
  { code: "USD", symbol: "$", label: "USD ($ Dollar)" },
  { code: "EUR", symbol: "€", label: "EUR (€ Euro)" },
];