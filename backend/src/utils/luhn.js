export const validateLuhn = (rawNumber) => {
  if (!rawNumber || typeof rawNumber !== 'string') return false;
  const cleaned = rawNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let alternate = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
};

export const getCardBrand = (rawNumber) => {
  const cleaned = (rawNumber || '').replace(/[\s-]/g, '');
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'Mastercard';
  if (/^3[47][0-9]{13}$/.test(cleaned)) return 'Amex';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) return 'Discover';
  return 'Unknown';
};
