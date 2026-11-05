/**
 * UangKu - Catatan Keuangan Harian
 * Utilities & Helper Functions
 */

const Utils = {
  /**
   * Format number to Indonesian Rupiah (Rp)
   * Example: 1500000 -> "Rp 1.500.000"
   */
  formatRupiah(amount, withPrefix = true) {
    const num = Number(amount);
    if (isNaN(num) || !isFinite(num)) {
      return withPrefix ? 'Rp 0' : '0';
    }
    const formatted = new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(num);

    return withPrefix ? `Rp ${formatted}` : formatted;
  },

  /**
   * Parse formatted or raw string to clean float / integer
   */
  parseNumber(value) {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value) return 0;
    // Strip everything except digits and optional minus/decimal
    const cleaned = String(value).replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  },

  /**
   * Format ISO date string (YYYY-MM-DD) into Indonesian readable date
   */
  formatDate(dateString, format = 'medium') {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length !== 3) return dateString;
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      
      if (isNaN(date.getTime())) return dateString;

      if (format === 'short') {
        return new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'short'
        }).format(date);
      }

      if (format === 'long') {
        return new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(date);
      }

      // Default: 'medium' e.g. "05 Nov 2026"
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  },

  /**
   * Returns a friendly relative or short label: "Hari ini", "Kemarin", or medium date
   */
  formatRelativeDate(dateString) {
    if (!dateString) return '-';
    const todayStr = this.getTodayDateString();
    if (dateString === todayStr) return 'Hari ini';

    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yesterdayStr = today.toISOString().split('T')[0];
    if (dateString === yesterdayStr) return 'Kemarin';

    return this.formatDate(dateString, 'medium');
  },

  /**
   * Get current date in YYYY-MM-DD format based on local timezone
   */
  getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Escape HTML entities to prevent XSS attacks when rendering user input
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Generate robust unique identifier
   */
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  },

  /**
   * Predefined Categories with icons and colors
   */
  categories: {
    expense: [
      { id: 'makanan', name: 'Makanan & Minuman', icon: 'utensils', emoji: '🍔', color: '#F97316' },
      { id: 'transportasi', name: 'Transportasi', icon: 'car', emoji: '🚗', color: '#3B82F6' },
      { id: 'belanja', name: 'Belanja Kebutuhan', icon: 'shopping-bag', emoji: '🛍️', color: '#EC4899' },
      { id: 'tagihan', name: 'Tagihan & Utilitas', icon: 'zap', emoji: '💡', color: '#EAB308' },
      { id: 'hiburan', name: 'Hiburan & Liburan', icon: 'gamepad-2', emoji: '🎮', color: '#8B5CF6' },
      { id: 'kesehatan', name: 'Kesehatan & Medis', icon: 'heart-pulse', emoji: '💊', color: '#EF4444' },
      { id: 'pendidikan', name: 'Pendidikan & Kursus', icon: 'book-open', emoji: '📚', color: '#06B6D4' },
      { id: 'keluarga', name: 'Keluarga & Anak', icon: 'users', emoji: '👨‍👩‍👧', color: '#10B981' },
      { id: 'lain-pengeluaran', name: 'Pengeluaran Lainnya', icon: 'more-horizontal', emoji: '📦', color: '#64748B' }
    ],
    income: [
      { id: 'gaji', name: 'Gaji Bulanan', icon: 'briefcase', emoji: '💼', color: '#10B981' },
      { id: 'bisnis', name: 'Bisnis & Penjualan', icon: 'trending-up', emoji: '📈', color: '#059669' },
      { id: 'freelance', name: 'Pekerjaan Freelance', icon: 'laptop', emoji: '💻', color: '#0284C7' },
      { id: 'investasi', name: 'Investasi & Dividen', icon: 'coins', emoji: '💰', color: '#D97706' },
      { id: 'hadiah', name: 'Hadiah & Bonus', icon: 'gift', emoji: '🎁', color: '#7C3AED' },
      { id: 'lain-pemasukan', name: 'Pemasukan Lainnya', icon: 'wallet', emoji: '💵', color: '#64748B' }
    ]
  },

  /**
   * Helper to lookup category metadata by ID
   */
  getCategoryInfo(categoryId, type = null) {
    const list = type 
      ? (this.categories[type] || [])
      : [...this.categories.expense, ...this.categories.income];

    const found = list.find(c => c.id === categoryId);
    if (found) return found;

    return {
      id: categoryId || 'lainnya',
      name: categoryId || 'Lain-lain',
      icon: 'circle-dot',
      emoji: '🏷️',
      color: '#64748B'
    };
  },

  /**
   * Trigger safe browser file download
   */
  downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  /**
   * Clean Debounce helper
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

window.Utils = Utils;
