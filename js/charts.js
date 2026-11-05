/**
 * UangKu - Catatan Keuangan Harian
 * Chart.js Integration & Visual Analytics
 */

const Charts = {
  expenseDoughnutChart: null,
  monthlyBarChart: null,
  reportCategoryChart: null,

  /**
   * Initialize or update Dashboard Category Expense Doughnut Chart
   */
  renderExpenseCategoryChart(canvasId, expenseByCategory) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js library is not loaded yet.');
      return;
    }

    const categories = Object.keys(expenseByCategory || {});
    const amounts = categories.map(cat => expenseByCategory[cat]);
    const total = amounts.reduce((a, b) => a + b, 0);

    // If existing chart, destroy first
    if (this.expenseDoughnutChart) {
      this.expenseDoughnutChart.destroy();
      this.expenseDoughnutChart = null;
    }

    const ctx = canvas.getContext('2d');
    const emptyNotice = document.getElementById('expense-chart-empty');

    if (categories.length === 0 || total === 0) {
      canvas.classList.add('hidden');
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      return;
    } else {
      canvas.classList.remove('hidden');
      if (emptyNotice) emptyNotice.classList.add('hidden');
    }

    const labels = categories.map(c => {
      const info = Utils.getCategoryInfo(c, 'expense');
      return `${info.emoji} ${info.name}`;
    });

    const colors = categories.map(c => {
      const info = Utils.getCategoryInfo(c, 'expense');
      return info.color || '#3B82F6';
    });

    this.expenseDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: {
                family: 'Plus Jakarta Sans, sans-serif',
                size: 11
              },
              color: '#475569'
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${Utils.formatRupiah(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 600
        }
      }
    });
  },

  /**
   * Render Income vs Expense Bar Chart for Reports
   */
  renderMonthlyBarChart(canvasId, monthlyData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (typeof Chart === 'undefined') return;

    if (this.monthlyBarChart) {
      this.monthlyBarChart.destroy();
      this.monthlyBarChart = null;
    }

    const ctx = canvas.getContext('2d');
    const labels = monthlyData.map(d => d.monthLabel);
    const incomeSeries = monthlyData.map(d => d.income);
    const expenseSeries = monthlyData.map(d => d.expense);

    this.monthlyBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: incomeSeries,
            backgroundColor: '#10B981',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'Pengeluaran',
            data: expenseSeries,
            backgroundColor: '#EF4444',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
              color: '#64748B'
            }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
              color: '#64748B',
              callback: function(val) {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + ' jt';
                if (val >= 1000) return (val / 1000).toFixed(0) + ' rb';
                return val;
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${Utils.formatRupiah(context.raw)}`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * Helper to aggregate past 6 months data for monthly bar chart
   */
  getPastMonthsData(transactions, monthCount = 6) {
    const result = [];
    const now = new Date();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthLabel = `${monthNames[monthIndex]} ${year}`;
      const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      let income = 0;
      let expense = 0;

      transactions.forEach(t => {
        if (t.date && t.date.startsWith(prefix)) {
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') income += amt;
          else if (t.type === 'expense') expense += amt;
        }
      });

      result.push({
        prefix,
        monthLabel,
        income,
        expense
      });
    }

    return result;
  }
};

window.Charts = Charts;
