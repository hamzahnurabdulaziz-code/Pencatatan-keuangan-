/**
 * UangKu - Catatan Keuangan Harian
 * UI Controller, DOM Rendering, Modals & Toast System
 */

const UI = {
  currentView: 'dashboard',
  transactionFilter: {
    search: '',
    type: 'all',
    category: 'all',
    period: 'all', // all, today, this_month, 7days, 30days, custom
    startDate: '',
    endDate: '',
    sort: 'date_desc' // date_desc, date_asc, amount_desc, amount_asc
  },
  reportFilter: {
    month: '', // YYYY-MM
  },
  currentPage: 1,
  itemsPerPage: 10,
  editingTransactionId: null,
  pendingDeleteId: null,

  /**
   * SVGs for reliable offline / zero-lag vector icons
   */
  icons: {
    wallet: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
    arrowUpRight: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>',
    arrowDownLeft: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7L7 17M7 17H17M7 17V7"/></svg>',
    scale: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>',
    plus: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
    edit: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
    trash: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
    checkCircle: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    alertTriangle: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    close: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
  },

  /**
   * Initialize UI Event Listeners and Initial State
   */
  init() {
    this.setupViewNavigation();
    this.setupModalListeners();
    this.setupFilterListeners();
    this.setupFormListeners();
    this.setupImportExportListeners();
    this.populateCategoryOptions('expense');
    this.initReportMonthSelector();

    // Subscribe to store updates
    Store.subscribe(() => {
      this.refreshCurrentView();
    });

    // Render initially
    this.switchView('dashboard');
  },

  /**
   * View Switcher (Dashboard, Transaksi, Laporan, Pengaturan)
   */
  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav links in desktop sidebar and mobile bar
    document.querySelectorAll('[data-view-nav]').forEach(el => {
      const target = el.getAttribute('data-view-nav');
      if (target === viewName) {
        el.classList.add('nav-active');
        el.classList.remove('nav-inactive');
      } else {
        el.classList.remove('nav-active');
        el.classList.add('nav-inactive');
      }
    });

    // Update mobile bottom nav
    document.querySelectorAll('[data-mobile-nav]').forEach(el => {
      const target = el.getAttribute('data-mobile-nav');
      if (target === viewName) {
        el.classList.add('mobile-nav-active');
        el.classList.remove('mobile-nav-inactive');
      } else {
        el.classList.remove('mobile-nav-active');
        el.classList.add('mobile-nav-inactive');
      }
    });

    // Show/Hide section panels
    const sections = ['dashboard', 'transaksi', 'laporan', 'pengaturan'];
    sections.forEach(sec => {
      const panel = document.getElementById(`view-${sec}`);
      if (panel) {
        if (sec === viewName) {
          panel.classList.remove('hidden');
          panel.classList.add('animate-fadeIn');
        } else {
          panel.classList.add('hidden');
          panel.classList.remove('animate-fadeIn');
        }
      }
    });

    // Set page header title
    const titles = {
      dashboard: 'Dashboard Ringkasan',
      transaksi: 'Manajemen Transaksi',
      laporan: 'Laporan & Analitik',
      pengaturan: 'Cadangan & Pengaturan'
    };
    const headerTitle = document.getElementById('current-page-title');
    if (headerTitle) {
      headerTitle.textContent = titles[viewName] || 'UangKu';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshCurrentView();
  },

  /**
   * Re-render content based on active view
   */
  refreshCurrentView() {
    if (this.currentView === 'dashboard') {
      this.renderDashboard();
    } else if (this.currentView === 'transaksi') {
      this.renderTransactionsView();
    } else if (this.currentView === 'laporan') {
      this.renderReportsView();
    } else if (this.currentView === 'pengaturan') {
      this.renderSettingsView();
    }
  },

  /**
   * Render Dashboard View (Stat Cards, Charts, Recent Transactions)
   */
  renderDashboard() {
    const stats = Store.calculateStats();

    // Stats Cards
    const elIncome = document.getElementById('dash-total-income');
    const elExpense = document.getElementById('dash-total-expense');
    const elBalance = document.getElementById('dash-total-balance');
    const elStatusBadge = document.getElementById('dash-financial-status');

    if (elIncome) elIncome.textContent = Utils.formatRupiah(stats.totalIncome);
    if (elExpense) elExpense.textContent = Utils.formatRupiah(stats.totalExpense);
    if (elBalance) {
      elBalance.textContent = Utils.formatRupiah(stats.balance);
      elBalance.className = `text-2xl md:text-3xl font-extrabold tracking-tight ${stats.balance < 0 ? 'text-red-600' : 'text-slate-900'}`;
    }

    if (elStatusBadge) {
      if (stats.balance > 0 && stats.savingsRate >= 30) {
        elStatusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        elStatusBadge.textContent = 'Kondisi Keuangan Prima 🌟';
      } else if (stats.balance >= 0) {
        elStatusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200';
        elStatusBadge.textContent = 'Keuangan Terkendali 👍';
      } else {
        elStatusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';
        elStatusBadge.textContent = 'Defisit / Waspada ⚠️';
      }
    }

    // Render Doughnut Chart for Categories
    Charts.renderExpenseCategoryChart('chart-expense-category', stats.expenseByCategory);

    // Render Recent Transactions (Top 6)
    const recentList = Store.getAll().slice(0, 6);
    const container = document.getElementById('dash-recent-transactions');
    const emptyState = document.getElementById('dash-recent-empty');

    if (container) {
      if (recentList.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
      } else {
        if (emptyState) emptyState.classList.add('hidden');
        container.innerHTML = recentList.map(tx => this.renderTransactionItemRow(tx, true)).join('');
      }
    }
  },

  /**
   * Render Full Transactions Management View
   */
  renderTransactionsView() {
    const all = Store.getAll();
    const filtered = this.applyFilters(all);

    // Summary banner for filtered results
    const filterStats = Store.calculateStats(filtered);
    const bIncome = document.getElementById('filter-sum-income');
    const bExpense = document.getElementById('filter-sum-expense');
    const bDiff = document.getElementById('filter-sum-diff');
    const bCount = document.getElementById('filter-count-badge');

    if (bIncome) bIncome.textContent = Utils.formatRupiah(filterStats.totalIncome);
    if (bExpense) bExpense.textContent = Utils.formatRupiah(filterStats.totalExpense);
    if (bDiff) {
      const diff = filterStats.totalIncome - filterStats.totalExpense;
      bDiff.textContent = Utils.formatRupiah(diff);
      bDiff.className = `font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }
    if (bCount) bCount.textContent = `${filtered.length} Transaksi`;

    // Pagination Calculation
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    // Render Table (Desktop) & Cards (Mobile)
    const tableBody = document.getElementById('transactions-table-body');
    const mobileCards = document.getElementById('transactions-mobile-list');
    const emptyState = document.getElementById('transactions-empty-state');
    const paginationControls = document.getElementById('transactions-pagination');

    if (totalItems === 0) {
      if (tableBody) tableBody.innerHTML = '';
      if (mobileCards) mobileCards.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (paginationControls) paginationControls.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (paginationControls) paginationControls.classList.remove('hidden');

    // Desktop Table Rows
    if (tableBody) {
      tableBody.innerHTML = paginatedItems.map(tx => this.renderTransactionTableRow(tx)).join('');
    }

    // Mobile Cards
    if (mobileCards) {
      mobileCards.innerHTML = paginatedItems.map(tx => this.renderTransactionItemRow(tx, false)).join('');
    }

    // Update Pagination UI
    this.renderPaginationUI(totalItems, startIndex, paginatedItems.length, totalPages);
  },

  /**
   * Filter and Sort Transactions Helper
   */
  applyFilters(list) {
    let result = [...list];
    const { search, type, category, period, startDate, endDate, sort } = this.transactionFilter;

    // Search query
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tx => {
        const cat = Utils.getCategoryInfo(tx.category, tx.type);
        return (tx.description && tx.description.toLowerCase().includes(q)) ||
               (cat && cat.name.toLowerCase().includes(q)) ||
               tx.category.toLowerCase().includes(q);
      });
    }

    // Type filter
    if (type && type !== 'all') {
      result = result.filter(tx => tx.type === type);
    }

    // Category filter
    if (category && category !== 'all') {
      result = result.filter(tx => tx.category === category);
    }

    // Period / Date filter
    const todayStr = Utils.getTodayDateString();
    if (period === 'today') {
      result = result.filter(tx => tx.date === todayStr);
    } else if (period === 'this_month') {
      const monthPrefix = todayStr.substring(0, 7); // YYYY-MM
      result = result.filter(tx => tx.date && tx.date.startsWith(monthPrefix));
    } else if (period === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      result = result.filter(tx => tx.date >= cutoffStr && tx.date <= todayStr);
    } else if (period === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      result = result.filter(tx => tx.date >= cutoffStr && tx.date <= todayStr);
    } else if (period === 'custom') {
      if (startDate) {
        result = result.filter(tx => tx.date >= startDate);
      }
      if (endDate) {
        result = result.filter(tx => tx.date <= endDate);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sort === 'amount_desc') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      if (sort === 'amount_asc') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      // default: date_desc
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  },

  /**
   * Render HTML for single Transaction Table Row (Desktop)
   */
  renderTransactionTableRow(tx) {
    const isIncome = tx.type === 'income';
    const cat = Utils.getCategoryInfo(tx.category, tx.type);
    const formattedAmount = isIncome 
      ? `+ ${Utils.formatRupiah(tx.amount)}`
      : `- ${Utils.formatRupiah(tx.amount)}`;
    const amountColorClass = isIncome ? 'text-emerald-600 font-semibold' : 'text-slate-900 font-semibold';
    const badgeType = isIncome 
      ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Pemasukan</span>'
      : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">Pengeluaran</span>';

    return `
      <tr class="hover:bg-slate-50/80 transition-colors duration-150 border-b border-slate-100 last:border-b-0">
        <td class="px-5 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
          ${Utils.escapeHtml(Utils.formatDate(tx.date, 'medium'))}
        </td>
        <td class="px-5 py-4 whitespace-nowrap">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs" style="background-color: ${cat.color}15; color: ${cat.color}">
              ${cat.emoji}
            </span>
            <div>
              <div class="text-sm font-medium text-slate-800">${Utils.escapeHtml(cat.name)}</div>
              <div class="text-xs text-slate-400">${badgeType}</div>
            </div>
          </div>
        </td>
        <td class="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title="${Utils.escapeHtml(tx.description || '-')}">
          ${Utils.escapeHtml(tx.description || '-')}
        </td>
        <td class="px-5 py-4 whitespace-nowrap text-sm text-right ${amountColorClass}">
          ${Utils.escapeHtml(formattedAmount)}
        </td>
        <td class="px-5 py-4 whitespace-nowrap text-center text-sm">
          <div class="flex items-center justify-center gap-1.5">
            <button 
              type="button" 
              onclick="UI.openEditModal('${tx.id}')"
              class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Transaksi"
              aria-label="Edit Transaksi">
              ${this.icons.edit}
            </button>
            <button 
              type="button" 
              onclick="UI.confirmDeleteTransaction('${tx.id}')"
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Hapus Transaksi"
              aria-label="Hapus Transaksi">
              ${this.icons.trash}
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  /**
   * Render HTML for Transaction Card (Mobile & Recent List)
   */
  renderTransactionItemRow(tx, isRecentCompact = false) {
    const isIncome = tx.type === 'income';
    const cat = Utils.getCategoryInfo(tx.category, tx.type);
    const formattedAmount = isIncome 
      ? `+ ${Utils.formatRupiah(tx.amount)}`
      : `- ${Utils.formatRupiah(tx.amount)}`;
    const amountColorClass = isIncome ? 'text-emerald-600' : 'text-slate-800';

    return `
      <div class="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg shadow-xs" style="background-color: ${cat.color}15; color: ${cat.color}">
            ${cat.emoji}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-slate-800 truncate">${Utils.escapeHtml(cat.name)}</div>
            <div class="text-xs text-slate-500 truncate">${Utils.escapeHtml(tx.description || '-')}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${Utils.escapeHtml(Utils.formatRelativeDate(tx.date))}</div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span class="text-sm sm:text-base font-bold ${amountColorClass}">
            ${Utils.escapeHtml(formattedAmount)}
          </span>
          <div class="flex items-center gap-1">
            <button 
              type="button" 
              onclick="UI.openEditModal('${tx.id}')"
              class="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
              title="Edit">
              ${this.icons.edit}
            </button>
            <button 
              type="button" 
              onclick="UI.confirmDeleteTransaction('${tx.id}')"
              class="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
              title="Hapus">
              ${this.icons.trash}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Pagination UI Controls
   */
  renderPaginationUI(totalItems, startIndex, currentCount, totalPages) {
    const info = document.getElementById('pagination-info');
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');

    if (info) {
      const from = totalItems > 0 ? startIndex + 1 : 0;
      const to = startIndex + currentCount;
      info.textContent = `Menampilkan ${from}-${to} dari ${totalItems} transaksi`;
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
      prevBtn.classList.toggle('opacity-50', this.currentPage <= 1);
      prevBtn.classList.toggle('cursor-not-allowed', this.currentPage <= 1);
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
      nextBtn.classList.toggle('opacity-50', this.currentPage >= totalPages);
      nextBtn.classList.toggle('cursor-not-allowed', this.currentPage >= totalPages);
    }
  },

  /**
   * Render Reports & Analytics View
   */
  renderReportsView() {
    const all = Store.getAll();
    const selectedMonth = this.reportFilter.month; // e.g. "2026-11" or "" for all

    let filtered = all;
    if (selectedMonth) {
      filtered = all.filter(t => t.date && t.date.startsWith(selectedMonth));
    }

    const stats = Store.calculateStats(filtered);

    // Monthly summary stat counters
    const elIncome = document.getElementById('rep-income');
    const elExpense = document.getElementById('rep-expense');
    const elNet = document.getElementById('rep-net');
    const elSavingsRate = document.getElementById('rep-savings-rate');
    const elDailyAvg = document.getElementById('rep-daily-avg');

    if (elIncome) elIncome.textContent = Utils.formatRupiah(stats.totalIncome);
    if (elExpense) elExpense.textContent = Utils.formatRupiah(stats.totalExpense);
    if (elNet) {
      elNet.textContent = Utils.formatRupiah(stats.balance);
      elNet.className = `text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }
    if (elSavingsRate) {
      elSavingsRate.textContent = `${stats.savingsRate}%`;
    }

    // Daily average expense calculation
    if (elDailyAvg) {
      let days = 30;
      if (selectedMonth) {
        const [y, m] = selectedMonth.split('-').map(Number);
        days = new Date(y, m, 0).getDate();
      }
      const dailyAvg = stats.totalExpense / days;
      elDailyAvg.textContent = Utils.formatRupiah(dailyAvg);
    }

    // Render monthly bar chart (last 6 months)
    const monthlySeries = Charts.getPastMonthsData(all, 6);
    Charts.renderMonthlyBarChart('chart-monthly-comparison', monthlySeries);

    // Render Category Breakdown List with Progress Bars
    const categoryListContainer = document.getElementById('rep-category-breakdown');
    if (categoryListContainer) {
      const categories = Object.keys(stats.expenseByCategory);
      if (categories.length === 0) {
        categoryListContainer.innerHTML = '<p class="text-sm text-slate-400 py-6 text-center">Belum ada pengeluaran pada periode ini.</p>';
      } else {
        // Sort highest amount first
        categories.sort((a, b) => stats.expenseByCategory[b] - stats.expenseByCategory[a]);
        const totalExp = stats.totalExpense || 1;

        categoryListContainer.innerHTML = categories.map(catKey => {
          const cat = Utils.getCategoryInfo(catKey, 'expense');
          const amt = stats.expenseByCategory[catKey];
          const pct = ((amt / totalExp) * 100).toFixed(1);

          return `
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs sm:text-sm font-medium">
                <span class="flex items-center gap-1.5 text-slate-700">
                  <span>${cat.emoji}</span>
                  <span>${Utils.escapeHtml(cat.name)}</span>
                </span>
                <span class="text-slate-900 font-semibold">${Utils.formatRupiah(amt)} <span class="text-xs text-slate-400 font-normal">(${pct}%)</span></span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${cat.color}"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  /**
   * Render Settings / Backup View
   */
  renderSettingsView() {
    const all = Store.getAll();
    const stats = Store.calculateStats();
    
    const countEl = document.getElementById('settings-total-records');
    const storageEl = document.getElementById('settings-storage-estimate');

    if (countEl) countEl.textContent = `${all.length} transaksi`;
    if (storageEl) {
      const bytes = new Blob([JSON.stringify(all)]).size;
      storageEl.textContent = `${(bytes / 1024).toFixed(2)} KB`;
    }
  },

  /**
   * Setup Reports Month Selector Options
   */
  initReportMonthSelector() {
    const select = document.getElementById('report-month-select');
    if (!select) return;

    select.innerHTML = '';
    const now = new Date();
    const currentPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.reportFilter.month = currentPrefix;

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Semua Bulan / Riwayat';
    select.appendChild(allOption);

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const opt = document.createElement('option');
      opt.value = prefix;
      opt.textContent = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (prefix === currentPrefix) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener('change', (e) => {
      this.reportFilter.month = e.target.value;
      this.renderReportsView();
    });
  },

  /**
   * Populate Category Dropdown based on transaction type (income / expense)
   */
  populateCategoryOptions(type = 'expense', selectedCategory = '') {
    const select = document.getElementById('tx-category');
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    const list = Utils.categories[type] || [];

    list.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.emoji} ${item.name}`;
      if (selectedCategory && selectedCategory === item.id) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  },

  /**
   * Setup Navigation Event Listeners
   */
  setupViewNavigation() {
    document.querySelectorAll('[data-view-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.getAttribute('data-view-nav');
        this.switchView(targetView);
      });
    });

    document.querySelectorAll('[data-mobile-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.getAttribute('data-mobile-nav');
        this.switchView(targetView);
      });
    });

    // Pagination Click Listeners
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderTransactionsView();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.renderTransactionsView();
      });
    }
  },

  /**
   * Setup Search & Filter Listeners on Transactions Tab
   */
  setupFilterListeners() {
    const searchInput = document.getElementById('filter-search');
    const typeSelect = document.getElementById('filter-type');
    const categorySelect = document.getElementById('filter-category');
    const periodSelect = document.getElementById('filter-period');
    const customDateContainer = document.getElementById('filter-custom-date-container');
    const startDateInput = document.getElementById('filter-start-date');
    const endDateInput = document.getElementById('filter-end-date');
    const sortSelect = document.getElementById('filter-sort');
    const resetBtn = document.getElementById('filter-reset-btn');

    // Populate category filter options with all categories
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="all">Semua Kategori</option>';
      const allCats = [...Utils.categories.expense, ...Utils.categories.income];
      allCats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.emoji} ${c.name}`;
        categorySelect.appendChild(opt);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.transactionFilter.search = e.target.value;
        this.currentPage = 1;
        this.renderTransactionsView();
      }, 250));
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.transactionFilter.type = e.target.value;
        this.currentPage = 1;
        this.renderTransactionsView();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.transactionFilter.category = e.target.value;
        this.currentPage = 1;
        this.renderTransactionsView();
      });
    }

    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.transactionFilter.period = e.target.value;
        if (customDateContainer) {
          if (e.target.value === 'custom') {
            customDateContainer.classList.remove('hidden');
          } else {
            customDateContainer.classList.add('hidden');
          }
        }
        this.currentPage = 1;
        this.renderTransactionsView();
      });
    }

    if (startDateInput) {
      startDateInput.addEventListener('change', (e) => {
        this.transactionFilter.startDate = e.target.value;
        this.currentPage = 1;
        this.renderTransactionsView();
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener('change', (e) => {
        this.transactionFilter.endDate = e.target.value;
        this.currentPage = 1;
        this.renderTransactionsView();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.transactionFilter.sort = e.target.value;
        this.renderTransactionsView();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.transactionFilter = {
          search: '',
          type: 'all',
          category: 'all',
          period: 'all',
          startDate: '',
          endDate: '',
          sort: 'date_desc'
        };
        if (searchInput) searchInput.value = '';
        if (typeSelect) typeSelect.value = 'all';
        if (categorySelect) categorySelect.value = 'all';
        if (periodSelect) periodSelect.value = 'all';
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        if (sortSelect) sortSelect.value = 'date_desc';
        if (customDateContainer) customDateContainer.classList.add('hidden');
        this.currentPage = 1;
        this.renderTransactionsView();
        this.showToast('Filter pencarian telah direset.', 'info');
      });
    }
  },

  /**
   * Setup Modal & Form Submit Listeners
   */
  setupModalListeners() {
    // Open Modal triggers
    document.querySelectorAll('[data-open-modal="add-transaction"]').forEach(btn => {
      btn.addEventListener('click', () => this.openAddModal());
    });

    // Close Modal buttons (generic)
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    // Close on background backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const modal = overlay.closest('.modal-container');
          if (modal) modal.classList.add('hidden');
        }
      });
    });

    // Keyboard ESC to close any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-container:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });

    // Modal Type Switch Buttons (Pemasukan vs Pengeluaran)
    const btnExpense = document.getElementById('tx-type-expense');
    const btnIncome = document.getElementById('tx-type-income');
    const hiddenType = document.getElementById('tx-type');

    if (btnExpense && btnIncome && hiddenType) {
      btnExpense.addEventListener('click', () => {
        hiddenType.value = 'expense';
        btnExpense.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-600 text-white shadow-xs transition-all';
        btnIncome.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
        this.populateCategoryOptions('expense');
      });

      btnIncome.addEventListener('click', () => {
        hiddenType.value = 'income';
        btnIncome.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow-xs transition-all';
        btnExpense.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
        this.populateCategoryOptions('income');
      });
    }

    // Live Nominal Rupiah Preview Helper
    const amountInput = document.getElementById('tx-amount');
    const amountPreview = document.getElementById('tx-amount-preview');

    if (amountInput && amountPreview) {
      amountInput.addEventListener('input', (e) => {
        const raw = Utils.parseNumber(e.target.value);
        if (raw > 0) {
          amountPreview.textContent = `Terbaca: ${Utils.formatRupiah(raw)}`;
          amountPreview.classList.remove('hidden');
        } else {
          amountPreview.classList.add('hidden');
        }
      });
    }
  },

  /**
   * Setup Form Submit Listeners
   */
  setupFormListeners() {
    const form = document.getElementById('transaction-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTransactionFormSubmit();
    });

    // Delete Confirmation Button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (this.pendingDeleteId) {
          const success = Store.delete(this.pendingDeleteId);
          if (success) {
            this.showToast('Transaksi berhasil dihapus!', 'success');
          } else {
            this.showToast('Gagal menghapus transaksi.', 'error');
          }
          this.closeModal('delete-modal');
          this.pendingDeleteId = null;
        }
      });
    }
  },

  /**
   * Setup Import & Export Listeners
   */
  setupImportExportListeners() {
    // Export CSV from any trigger
    document.querySelectorAll('[data-action="export-csv"]').forEach(btn => {
      btn.addEventListener('click', () => {
        ExportImport.exportToCSV();
      });
    });

    // Export JSON backup
    document.querySelectorAll('[data-action="export-json"]').forEach(btn => {
      btn.addEventListener('click', () => {
        ExportImport.exportToJSON();
      });
    });

    // Print Report
    document.querySelectorAll('[data-action="print-report"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.print();
      });
    });

    // Load Demo Data
    const loadDemoBtn = document.getElementById('btn-load-demo-data');
    if (loadDemoBtn) {
      loadDemoBtn.addEventListener('click', () => {
        Store.loadInitialDemoData();
        this.showToast('Data contoh (demo) berhasil dimuat!', 'success');
      });
    }

    // Reset All Data Modal & Trigger
    const resetAllBtn = document.getElementById('btn-reset-all-data');
    const confirmResetBtn = document.getElementById('confirm-reset-all-btn');

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        this.openModal('reset-confirm-modal');
      });
    }

    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        Store.clearAll();
        this.closeModal('reset-confirm-modal');
        this.showToast('Semua data berhasil dibersihkan.', 'info');
      });
    }

    // JSON File Import Handling
    const jsonFileInput = document.getElementById('json-file-input');
    const importSubmitBtn = document.getElementById('btn-submit-import');

    if (jsonFileInput && importSubmitBtn) {
      importSubmitBtn.addEventListener('click', async () => {
        const file = jsonFileInput.files[0];
        if (!file) {
          this.showToast('Pilih file backup .json terlebih dahulu!', 'warning');
          return;
        }

        const mode = document.querySelector('input[name="import-mode"]:checked')?.value || 'replace';

        try {
          const payload = await ExportImport.readJSONFile(file);
          const validTransactions = ExportImport.extractTransactionsFromPayload(payload);

          if (validTransactions.length === 0) {
            throw new Error('Tidak ditemukan catatan transaksi yang valid dalam file.');
          }

          let count = 0;
          if (mode === 'merge') {
            count = Store.mergeData(validTransactions);
            this.showToast(`Berhasil menggabungkan ${count} transaksi!`, 'success');
          } else {
            count = Store.replaceData(validTransactions);
            this.showToast(`Berhasil memulihkan ${count} transaksi!`, 'success');
          }

          jsonFileInput.value = '';
          this.closeModal('import-json-modal');
        } catch (err) {
          console.error(err);
          this.showToast(err.message, 'error');
        }
      });
    }
  },

  /**
   * Handle Add / Edit Transaction Form Submission
   */
  handleTransactionFormSubmit() {
    const type = document.getElementById('tx-type').value;
    const amountVal = document.getElementById('tx-amount').value;
    const date = document.getElementById('tx-date').value;
    const category = document.getElementById('tx-category').value;
    const description = document.getElementById('tx-description').value;

    const amount = Utils.parseNumber(amountVal);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      this.showToast('Nominal harus lebih besar dari 0!', 'error');
      document.getElementById('tx-amount').focus();
      return;
    }

    if (!category) {
      this.showToast('Harap pilih kategori transaksi!', 'error');
      document.getElementById('tx-category').focus();
      return;
    }

    if (!date) {
      this.showToast('Harap pilih tanggal transaksi!', 'error');
      document.getElementById('tx-date').focus();
      return;
    }

    try {
      if (this.editingTransactionId) {
        // Update
        Store.update(this.editingTransactionId, {
          type,
          amount,
          date,
          category,
          description
        });
        this.showToast('Transaksi berhasil diperbarui!', 'success');
      } else {
        // Add
        Store.add({
          type,
          amount,
          date,
          category,
          description
        });
        this.showToast('Transaksi baru berhasil ditambahkan!', 'success');
      }

      this.closeModal('transaction-modal');
    } catch (err) {
      this.showToast(err.message || 'Terjadi kesalahan saat menyimpan.', 'error');
    }
  },

  /**
   * Open Modal for Adding New Transaction
   */
  openAddModal() {
    this.editingTransactionId = null;
    const form = document.getElementById('transaction-form');
    if (form) form.reset();

    const titleEl = document.getElementById('modal-transaction-title');
    if (titleEl) titleEl.textContent = 'Tambah Transaksi Baru';

    // Default to today and expense
    const dateInput = document.getElementById('tx-date');
    if (dateInput) dateInput.value = Utils.getTodayDateString();

    const btnExpense = document.getElementById('tx-type-expense');
    const btnIncome = document.getElementById('tx-type-income');
    const hiddenType = document.getElementById('tx-type');

    if (hiddenType) hiddenType.value = 'expense';
    if (btnExpense) btnExpense.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-600 text-white shadow-xs transition-all';
    if (btnIncome) btnIncome.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';

    const amountPreview = document.getElementById('tx-amount-preview');
    if (amountPreview) amountPreview.classList.add('hidden');

    this.populateCategoryOptions('expense');
    this.openModal('transaction-modal');

    // Auto-focus nominal
    setTimeout(() => {
      const amountInput = document.getElementById('tx-amount');
      if (amountInput) amountInput.focus();
    }, 150);
  },

  /**
   * Open Modal for Editing Transaction
   */
  openEditModal(id) {
    const tx = Store.getById(id);
    if (!tx) {
      this.showToast('Transaksi tidak ditemukan.', 'error');
      return;
    }

    this.editingTransactionId = id;
    const titleEl = document.getElementById('modal-transaction-title');
    if (titleEl) titleEl.textContent = 'Edit Transaksi';

    const hiddenType = document.getElementById('tx-type');
    const btnExpense = document.getElementById('tx-type-expense');
    const btnIncome = document.getElementById('tx-type-income');
    const amountInput = document.getElementById('tx-amount');
    const dateInput = document.getElementById('tx-date');
    const descInput = document.getElementById('tx-description');
    const amountPreview = document.getElementById('tx-amount-preview');

    if (hiddenType) hiddenType.value = tx.type;

    if (tx.type === 'income') {
      if (btnIncome) btnIncome.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow-xs transition-all';
      if (btnExpense) btnExpense.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
      this.populateCategoryOptions('income', tx.category);
    } else {
      if (btnExpense) btnExpense.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-600 text-white shadow-xs transition-all';
      if (btnIncome) btnIncome.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
      this.populateCategoryOptions('expense', tx.category);
    }

    if (amountInput) amountInput.value = tx.amount;
    if (dateInput) dateInput.value = tx.date;
    if (descInput) descInput.value = tx.description || '';

    if (amountPreview) {
      amountPreview.textContent = `Terbaca: ${Utils.formatRupiah(tx.amount)}`;
      amountPreview.classList.remove('hidden');
    }

    this.openModal('transaction-modal');
  },

  /**
   * Show Delete Confirmation Modal
   */
  confirmDeleteTransaction(id) {
    const tx = Store.getById(id);
    if (!tx) return;

    this.pendingDeleteId = id;
    const cat = Utils.getCategoryInfo(tx.category, tx.type);
    const previewEl = document.getElementById('delete-item-preview');

    if (previewEl) {
      previewEl.innerHTML = `
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs sm:text-sm space-y-1">
          <div class="font-semibold text-slate-800">${cat.emoji} ${Utils.escapeHtml(cat.name)}</div>
          <div class="text-slate-600">${Utils.escapeHtml(tx.description || '-')}</div>
          <div class="text-xs text-slate-400">${Utils.escapeHtml(Utils.formatDate(tx.date, 'long'))}</div>
          <div class="text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'} pt-1">
            ${tx.type === 'income' ? '+' : '-'} ${Utils.formatRupiah(tx.amount)}
          </div>
        </div>
      `;
    }

    this.openModal('delete-modal');
  },

  /**
   * Open Modal Helper
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  },

  /**
   * Close Modal Helper
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * Toast Notification System (auto dismiss after 3.2s)
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const toastId = 'toast_' + Date.now();
    toast.id = toastId;

    let bgBorder = 'bg-white border-slate-200 text-slate-800';
    let iconSvg = this.icons.info;
    let iconColor = 'text-blue-500';

    if (type === 'success') {
      bgBorder = 'bg-white border-emerald-200 text-slate-800';
      iconSvg = this.icons.checkCircle;
      iconColor = 'text-emerald-500';
    } else if (type === 'error') {
      bgBorder = 'bg-white border-rose-200 text-slate-800';
      iconSvg = this.icons.alertTriangle;
      iconColor = 'text-rose-500';
    } else if (type === 'warning') {
      bgBorder = 'bg-white border-amber-200 text-slate-800';
      iconSvg = this.icons.alertTriangle;
      iconColor = 'text-amber-500';
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgBorder} animate-slideDown text-sm font-medium pointer-events-auto max-w-sm w-full`;
    toast.innerHTML = `
      <div class="${iconColor} flex-shrink-0">${iconSvg}</div>
      <div class="flex-1 text-xs sm:text-sm text-slate-700 leading-snug">${Utils.escapeHtml(message)}</div>
      <button type="button" class="text-slate-400 hover:text-slate-600 p-1" onclick="document.getElementById('${toastId}').remove()" aria-label="Tutup notifikasi">
        ${this.icons.close}
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

window.UI = UI;
