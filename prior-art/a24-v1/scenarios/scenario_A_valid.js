'use strict';

module.exports = {
  name: 'A_VALID',
  steps: [
    {
      name: 'Valid proposal from SOT',
      tenetInput: {
        actorId: 'EXT-AI',
        actionId: 'UPDATE',
        sourceDomain: 'SOT',
        targetDomain: 'SOT',
        hasContract: true,
        hasProvenance: true,
        provenanceMatch: true,
        retryCount: 0,
        maxRetries: 3,
        withinQuota: true,
        anomalyDetected: false
      },
      authInput: {
        callerRune: 1,
        capabilityId: 9,
        tablePath: 'out/rune_table_20260112.csv'
      },
      verifyTable: 'out/rune_table_20260112.csv'
    }
  ]
};