/**
 * UangKu - Catatan Keuangan Harian
 * Application Bootstrap & Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize Store (loads from localStorage or seed data)
    Store.init();

    // 2. Initialize UI Controller
    UI.init();

    // 3. Optional: Quick keyboard shortcut 'N' or '+' to add transaction
    document.addEventListener('keydown', (e) => {
      // Avoid triggering when user is typing in an input or textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        UI.openAddModal();
      }
    });

    console.info('UangKu - Catatan Keuangan Harian initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize UangKu application:', err);
  }
});
