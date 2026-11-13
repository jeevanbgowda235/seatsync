// ====================================================================
// SeatSync Indian Localization & Formatting Utilities
// ====================================================================

/**
 * Format a numeric amount into Indian Rupee (INR) representation
 * Example: 1500.5 -> "₹1,500.50"
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Format date string or Date object into standard Indian format (DD/MM/YYYY)
 * Example: "2026-11-14T09:00:00Z" -> "14/11/2026"
 */
export function formatIndianDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  
  // Handle plain date strings like "2026-11-14"
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [year, month, day] = dateInput.trim().split('-');
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date-time into Indian standard format (DD/MM/YYYY, hh:mm AM/PM)
 * Example: "14/11/2026, 09:30 AM"
 */
export function formatIndianDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * High-quality fallback book covers generated with SVG data URIs
 * Ensures no broken image icons ever display in the catalogue or dashboard
 */
export function getFallbackBookCover(title: string = 'Library Book', category: string = 'Academic'): string {
  const cleanTitle = title.replace(/[<>&"]/g, '').slice(0, 32);
  const cleanCat = category.replace(/[<>&"]/g, '').slice(0, 24);

  // High-contrast academic gradient SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1e3a8a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#f59e0b" />
        <stop offset="100%" style="stop-color:#fbbf24" />
      </linearGradient>
    </defs>
    <rect width="300" height="420" fill="url(#grad)" rx="8" />
    <rect x="0" y="0" width="24" height="420" fill="#0c1322" opacity="0.6" />
    <line x1="24" y1="0" x2="24" y2="420" stroke="#38bdf8" stroke-width="1.5" opacity="0.4" />
    <rect x="40" y="40" width="220" height="6" fill="url(#gold)" rx="3" />
    <text x="40" y="75" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#38bdf8" letter-spacing="2">${cleanCat.toUpperCase()}</text>
    <text x="40" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">
      <tspan x="40" dy="0">${cleanTitle.slice(0, 16)}</tspan>
      <tspan x="40" dy="26">${cleanTitle.slice(16, 32)}</tspan>
    </text>
    <circle cx="150" cy="270" r="42" fill="#0369a1" opacity="0.3" />
    <path d="M135 255 L165 255 L165 285 L135 285 Z" fill="none" stroke="#38bdf8" stroke-width="2" />
    <path d="M130 270 Q150 260 170 270" stroke="#f59e0b" stroke-width="3" fill="none" />
    <rect x="40" y="360" width="220" height="1" fill="#334155" />
    <text x="40" y="385" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">SEATSYNC CENTRAL LIBRARY</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
