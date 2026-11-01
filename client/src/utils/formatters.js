/**
 * @fileoverview Utility formatters for civic UI (bytes, dates, language labels).
 */

/**
 * Formats a byte size into a human-readable string (KB, MB).
 *
 * @param {number} bytes - Number of bytes.
 * @returns {string} Formatted size string.
 */
export const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Formats an ISO date string into Indian locale display date.
 *
 * @param {string|Date} dateInput - ISO date or Date object.
 * @returns {string} Formatted date string (e.g. "12 Oct 2024").
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Formats an ISO date string with time.
 *
 * @param {string|Date} dateInput - ISO date or Date object.
 * @returns {string} Formatted date and time string.
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};
