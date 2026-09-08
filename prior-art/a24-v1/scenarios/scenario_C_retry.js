'use strict';

module.exports = {
  name: 'C_RETRY',
  steps: [
    {
      name: 'Retry attempt 1',
      tenetInput: {
        actorId: 'EXT-AI',
        actionId: 'UPDATE',
        sourceDomain: 'USERLAND',
        targetDomain: 'SOT',
        hasContract: false,
        hasProvenance: false,
        provenanceMatch: false,
        retryCount: 1,
        maxRetries: 1,
        withinQuota: true,
        anomalyDetected: false
      }
    },
    {
      name: 'Retry attempt 2 (exceeds)',
      tenetInput: {
        actorId: 'EXT-AI',
        actionId: 'UPDATE',
        sourceDomain: 'USERLAND',
        targetDomain: 'SOT',
        hasContract: false,
        hasProvenance: false,
        provenanceMatch: false,
        retryCount: 2,
        maxRetries: 1,
        withinQuota: true,
        anomalyDetected: false
      }
    }
  ]
};