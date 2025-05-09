
export const formatCurrency = (amount, locale = 'es-CL', currency = 'CLP') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};


export const formatDate = (date, options = {}, locale = 'es-CL') => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};


export const formatDateTime = (date, locale = 'es-CL') => {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }, locale);
};