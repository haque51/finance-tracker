/**
 * Exchange Rate API Utility
 * Fetches real-time exchange rates from Frankfurter API (EU Central Bank rates)
 * Free API, no key required
 * Base URL: https://api.frankfurter.app
 */

const EXCHANGE_API_BASE = 'https://api.frankfurter.app';

/**
 * Fetch latest exchange rates for specified currencies
 * @param {string} baseCurrency - Base currency code (e.g., 'EUR')
 * @param {string[]} targetCurrencies - Array of target currency codes
 * @returns {Promise<Object>} Object with currency codes as keys and rates as values
 */
export async function fetchExchangeRates(baseCurrency = 'EUR', targetCurrencies = ['USD', 'BDT']) {
  try {
    // Frankfurter API doesn't support all currencies (e.g., no BDT)
    // So we'll use exchangerate-api.com as fallback for unsupported currencies

    const supportedByFrankfurter = targetCurrencies.filter(c =>
      !['BDT'].includes(c) // List of currencies NOT supported by Frankfurter
    );

    const unsupportedCurrencies = targetCurrencies.filter(c =>
      ['BDT'].includes(c)
    );

    const rates = { [baseCurrency]: 1 }; // Base currency rate is always 1

    // Fetch supported currencies from Frankfurter
    if (supportedByFrankfurter.length > 0) {
      const symbols = supportedByFrankfurter.join(',');
      const frankfurterUrl = `${EXCHANGE_API_BASE}/latest?from=${baseCurrency}&to=${symbols}`;

      const response = await fetch(frankfurterUrl);

      if (!response.ok) {
        throw new Error(`Frankfurter API error: ${response.status}`);
      }

      const data = await response.json();

      // Merge rates
      Object.assign(rates, data.rates);
    }

    // Fetch unsupported currencies from exchangerate-api.com (free tier, no key)
    if (unsupportedCurrencies.length > 0) {
      const fallbackUrl = `https://open.exchangerate-api.com/v6/latest/${baseCurrency}`;

      try {
        const response = await fetch(fallbackUrl);

        if (response.ok) {
          const data = await response.json();

          unsupportedCurrencies.forEach(currency => {
            if (data.rates[currency]) {
              rates[currency] = data.rates[currency];
            }
          });
        }
      } catch (fallbackError) {
        console.warn('Fallback API failed for unsupported currencies:', fallbackError);
        // Use default rates for unsupported currencies
        unsupportedCurrencies.forEach(currency => {
          rates[currency] = getDefaultRate(currency, baseCurrency);
        });
      }
    }

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    // Return default rates as fallback
    return getDefaultRates(baseCurrency, targetCurrencies);
  }
}

/**
 * Get default exchange rate for a currency pair (fallback)
 * @param {string} currency - Target currency code
 * @param {string} baseCurrency - Base currency code
 * @returns {number} Default exchange rate
 */
function getDefaultRate(currency, baseCurrency) {
  // Default rates (approximate, as of late 2024)
  const defaultRates = {
    'EUR': {
      'USD': 1.08,
      'BDT': 118.5,  // 1 EUR = 118.5 BDT
      'EUR': 1
    },
    'USD': {
      'EUR': 0.93,
      'BDT': 110,
      'USD': 1
    },
    'BDT': {
      'EUR': 0.0084,  // 1 BDT = 0.0084 EUR
      'USD': 0.0091,
      'BDT': 1
    }
  };

  if (defaultRates[baseCurrency] && defaultRates[baseCurrency][currency]) {
    return defaultRates[baseCurrency][currency];
  }

  return 1; // Fallback to 1:1 if no default rate available
}

/**
 * Get default rates for all requested currencies
 * @param {string} baseCurrency - Base currency
 * @param {string[]} targetCurrencies - Target currencies
 * @returns {Object} Default rates object
 */
function getDefaultRates(baseCurrency, targetCurrencies) {
  const rates = { [baseCurrency]: 1 };

  targetCurrencies.forEach(currency => {
    rates[currency] = getDefaultRate(currency, baseCurrency);
  });

  return rates;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object (with base as reference)
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert to base currency first, then to target currency
  return (amount / fromRate) * toRate;
}

/**
 * Format currency amount with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency) {
  const symbols = {
    'EUR': '€',
    'USD': '$',
    'BDT': '৳'
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (currency === 'USD') {
    return `${symbol}${formatted}`;
  }

  return `${formatted} ${symbol}`;
}
