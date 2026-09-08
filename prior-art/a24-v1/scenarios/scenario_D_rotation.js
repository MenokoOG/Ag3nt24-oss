'use strict';

module.exports = {
  name: 'D_ROTATION',
  steps: [
    {
      name: 'Day 1 request (allowed)',
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
      verifyTable: 'out/rune_table_20260112.csv',

      /**
       * Optional hint for the runner:
       * - If your runner supports emitting authReason, it should set:
       *   authReason = (authorized ? null : 'NOT_AUTHORIZED_FOR_TODAY')
       */
      expect: {
        result: 'ALLOW'
      }
    },
    {
      name: 'Day 2 same request (denied by rotation)',
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
        tablePath: 'out/rune_table_20260113.csv'
      },
      verifyTable: 'out/rune_table_20260113.csv',

      expect: {
        result: 'DENY',
        authReason: 'NOT_AUTHORIZED_FOR_TODAY'
      }
    }
  ]
};