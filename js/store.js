/**
 * UangKu - Catatan Keuangan Harian
 * Store & Data Layer (localStorage)
 */

const Store = {
  STORAGE_KEY: 'uangku_transactions_v2',
  SETTINGS_KEY: 'uangku_settings_v2',
  
  state: {
    transactions: [],
    listeners: []
  },

  /**
   * Initialize Store from LocalStorage
   */
  init() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.state.transactions = parsed.filter(this.isValidTransaction);
        } else {
          this.state.transactions = [];
        }
      } else {
        // First visit: provide rich sample demo data so user immediately sees value
        this.loadInitialDemoData();
      }
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
      this.state.transactions = [];
    }
  },

  /**
   * Validate raw transaction object shape
   */
  isValidTransaction(tx) {
    if (!tx || typeof tx !== 'object') return false;
    if (!tx.id || typeof tx.id !== 'string') return false;
    if (tx.type !== 'income' && tx.type !== 'expense') return false;
    const amount = Number(tx.amount);
    if (isNaN(amount) || amount <= 0) return false;
    if (!tx.date || typeof tx.date !== 'string') return false;
    if (!tx.category || typeof tx.category !== 'string') return false;
    return true;
  },

  /**
   * Save current in-memory transactions to localStorage and notify listeners
   */
  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state.transactions));
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      return false;
    }
  },

  /**
   * Subscribe to data changes
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.state.listeners.push(listener);
    }
    return () => {
      this.state.listeners = this.state.listeners.filter(l => l !== listener);
    };
  },

  /**
   * Notify all registered listeners
   */
  notify() {
    this.state.listeners.forEach(fn => {
      try {
        fn(this.state.transactions);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  },

  /**
   * Get all transactions sorted by date descending (latest first)
   */
  getAll() {
    return [...this.state.transactions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  },

  /**
   * Get single transaction by ID
   */
  getById(id) {
    return this.state.transactions.find(tx => tx.id === id) || null;
  },

  /**
   * Add new transaction
   */
  add(txData) {
    const amount = Utils.parseNumber(txData.amount);
    if (amount <= 0) {
      throw new Error('Nominal transaksi harus lebih besar dari 0.');
    }
    if (!txData.category) {
      throw new Error('Pilih kategori transaksi.');
    }
    if (!txData.date) {
      throw new Error('Pilih tanggal transaksi.');
    }

    const newTx = {
      id: Utils.generateId(),
      type: txData.type === 'income' ? 'income' : 'expense',
      amount: amount,
      category: txData.category.trim(),
      description: (txData.description || '').trim(),
      date: txData.date,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.state.transactions.push(newTx);
    this.save();
    return newTx;
  },

  /**
   * Update existing transaction
   */
  update(id, updatedFields) {
    const index = this.state.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan.');
    }

    const current = this.state.transactions[index];
    let amount = current.amount;
    if (updatedFields.amount !== undefined) {
      amount = Utils.parseNumber(updatedFields.amount);
      if (amount <= 0) {
        throw new Error('Nominal transaksi harus lebih besar dari 0.');
      }
    }

    const updatedTx = {
      ...current,
      type: updatedFields.type !== undefined ? (updatedFields.type === 'income' ? 'income' : 'expense') : current.type,
      amount: amount,
      category: updatedFields.category !== undefined ? updatedFields.category.trim() : current.category,
      description: updatedFields.description !== undefined ? updatedFields.description.trim() : current.description,
      date: updatedFields.date !== undefined ? updatedFields.date : current.date,
      updatedAt: Date.now()
    };

    this.state.transactions[index] = updatedTx;
    this.save();
    return updatedTx;
  },

  /**
   * Delete transaction by ID
   */
  delete(id) {
    const index = this.state.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.state.transactions.splice(index, 1);
    this.save();
    return true;
  },

  /**
   * Delete all transactions
   */
  clearAll() {
    this.state.transactions = [];
    this.save();
  },

  /**
   * Replace all data with imported data (Backup Restore)
   */
  replaceData(newData) {
    if (!Array.isArray(newData)) {
      throw new Error('Format data tidak valid (harus array).');
    }
    const valid = newData.filter(this.isValidTransaction);
    this.state.transactions = valid;
    this.save();
    return valid.length;
  },

  /**
   * Merge imported data with existing, deduplicating by ID
   */
  mergeData(incomingData) {
    if (!Array.isArray(incomingData)) {
      throw new Error('Format data tidak valid.');
    }
    const valid = incomingData.filter(this.isValidTransaction);
    let addedCount = 0;
    
    valid.forEach(item => {
      const existingIdx = this.state.transactions.findIndex(t => t.id === item.id);
      if (existingIdx >= 0) {
        // update existing
        this.state.transactions[existingIdx] = { ...this.state.transactions[existingIdx], ...item };
      } else {
        this.state.transactions.push(item);
        addedCount++;
      }
    });

    this.save();
    return addedCount;
  },

  /**
   * Calculate summary statistics from an array of transactions
   */
  calculateStats(transactions = null) {
    const list = transactions || this.state.transactions;
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};
    const incomeByCategory = {};

    list.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amt;
      } else if (tx.type === 'expense') {
        totalExpense += amt;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amt;
      }
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      transactionCount: list.length,
      expenseByCategory,
      incomeByCategory
    };
  },

  /**
   * Load clean demo data for first time onboarding
   */
  loadInitialDemoData() {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const getDateStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    this.state.transactions = [
      {
        id: 'demo-1',
        type: 'income',
        amount: 8500000,
        category: 'gaji',
        description: 'Gaji Pokok Bulanan Perusahaan',
        date: getDateStr(5),
        createdAt: Date.now() - 5 * 86400000,
        updatedAt: Date.now() - 5 * 86400000
      },
      {
        id: 'demo-2',
        type: 'income',
        amount: 1750000,
        category: 'freelance',
        description: 'Pembayaran Project Landing Page Web',
        date: getDateStr(3),
        createdAt: Date.now() - 3 * 86400000,
        updatedAt: Date.now() - 3 * 86400000
      },
      {
        id: 'demo-3',
        type: 'expense',
        amount: 350000,
        category: 'tagihan',
        description: 'Tagihan Listrik PLN & Internet Wi-Fi',
        date: getDateStr(4),
        createdAt: Date.now() - 4 * 86400000,
        updatedAt: Date.now() - 4 * 86400000
      },
      {
        id: 'demo-4',
        type: 'expense',
        amount: 450000,
        category: 'belanja',
        description: 'Belanja Mingguan Sayur & Buah Segar',
        date: getDateStr(3),
        createdAt: Date.now() - 3 * 86400000,
        updatedAt: Date.now() - 3 * 86400000
      },
      {
        id: 'demo-5',
        type: 'expense',
        amount: 65000,
        category: 'makanan',
        description: 'Makan Siang & Es Kopi Susu',
        date: getDateStr(1),
        createdAt: Date.now() - 1 * 86400000,
        updatedAt: Date.now() - 1 * 86400000
      },
      {
        id: 'demo-6',
        type: 'expense',
        amount: 120000,
        category: 'transportasi',
        description: 'Isi Bensin Pertamax & Saldo Tol',
        date: getDateStr(0),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    this.save();
  }
};

window.Store = Store;
