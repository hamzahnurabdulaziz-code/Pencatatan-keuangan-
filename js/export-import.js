/**
 * UangKu - Catatan Keuangan Harian
 * Export & Import Handler (CSV & JSON)
 */

const ExportImport = {
  /**
   * Export transactions array to CSV file (Excel-ready with UTF-8 BOM)
   */
  exportToCSV(transactions = null) {
    const data = transactions || Store.getAll();
    if (!data || data.length === 0) {
      if (window.UI && typeof window.UI.showToast === 'function') {
        window.UI.showToast('Tidak ada data transaksi untuk diekspor.', 'warning');
      }
      return;
    }

    const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal (Rp)', 'Dibuat Pada'];
    const rows = data.map(tx => {
      const typeLabel = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const catInfo = Utils.getCategoryInfo(tx.category, tx.type);
      const catName = catInfo ? catInfo.name : tx.category;
      const createdStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : '-';

      return [
        tx.id,
        tx.date,
        typeLabel,
        catName,
        tx.description || '',
        tx.amount,
        createdStr
      ];
    });

    // Escape CSV cell according to RFC 4180
    const escapeCSV = (value) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n');

    // Add UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility on Windows
    const bomCsv = '\uFEFF' + csvContent;
    const dateStr = Utils.getTodayDateString();
    const filename = `uangku-transaksi-${dateStr}.csv`;

    Utils.downloadFile(filename, bomCsv, 'text/csv;charset=utf-8;');
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast(`Berhasil mengekspor ${data.length} transaksi ke CSV!`, 'success');
    }
  },

  /**
   * Export all data to JSON backup file
   */
  exportToJSON() {
    const transactions = Store.getAll();
    const backupData = {
      app: 'UangKu',
      appName: 'UangKu - Catatan Keuangan Harian',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      totalTransactions: transactions.length,
      transactions: transactions
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = Utils.getTodayDateString();
    const filename = `cadangan-uangku-${dateStr}.json`;

    Utils.downloadFile(filename, jsonString, 'application/json;charset=utf-8;');
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast(`Cadangan data berhasil diunduh (${transactions.length} transaksi).`, 'success');
    }
  },

  /**
   * Read and parse an uploaded JSON file
   */
  readJSONFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('Pilih file terlebih dahulu.'));
      }
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        return reject(new Error('Hanya file berformat .json yang didukung.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          resolve(parsed);
        } catch (err) {
          reject(new Error('File JSON rusak atau tidak valid: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsText(file, 'utf-8');
    });
  },

  /**
   * Validate and extract transactions list from parsed JSON payload
   */
  extractTransactionsFromPayload(payload) {
    let list = null;
    if (Array.isArray(payload)) {
      list = payload;
    } else if (payload && typeof payload === 'object' && Array.isArray(payload.transactions)) {
      list = payload.transactions;
    }

    if (!list) {
      throw new Error('Struktur file cadangan tidak sesuai.');
    }

    const validItems = list.filter(item => Store.isValidTransaction(item));
    if (validItems.length === 0 && list.length > 0) {
      throw new Error('Tidak ada data transaksi valid yang ditemukan dalam file.');
    }

    return validItems;
  }
};

window.ExportImport = ExportImport;
