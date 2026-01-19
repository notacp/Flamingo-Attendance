/**
 * Helper to get a stable local date string in YYYY-MM-DD format.
 */
export function getTodayISO() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Normalizes various date string formats to YYYY-MM-DD.
 * Handles:
 * - YYYY-MM-DD (ISO date)
 * - DD/MM/YYYY (Common local)
 * - ISO Timestamps/Generic dates
 */
export function normalizeDate(dateStr: string) {
    if (!dateStr) return '';

    // 1. Direct match for YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

    // 2. Direct match for DD/MM/YYYY
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
        const day = ddmmyyyy[1].padStart(2, '0');
        const month = ddmmyyyy[2].padStart(2, '0');
        const year = ddmmyyyy[3];
        return `${year}-${month}-${day}`;
    }

    // 3. Fallback: Parse with Date object
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr

        // Extract local date components to avoid timezone shifts
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    } catch (e) {
        return dateStr;
    }
}

/**
 * Formats a date string (YYYY-MM-DD or other) for display.
 * Ensures the date is treated as local day rather than UTC.
 */
export function formatDateForDisplay(dateStr: string, options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
}) {
    if (!dateStr) return '';

    // Handle YYYY-MM-DD specifically to avoid UTC shift
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let d: Date;
    if (match) {
        d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    } else {
        d = new Date(dateStr);
    }

    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString("en-US", options);
}
