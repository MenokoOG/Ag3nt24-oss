'use strict';

module.exports = {
  name: 'E_TAMPER',
  steps: [
    {
      name: 'Tampered table usage',
      verifyTable: 'out/rune_table_20260112_TAMPERED.csv'
    }
  ]
};