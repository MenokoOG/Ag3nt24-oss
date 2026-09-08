'use strict';

module.exports = {
  name: 'B_DRIFT',
  steps: [
    {
      name: 'Drifted provenance submission',
      tenetInput: {
        actorId: 'EXT-AI',
        actionId: 'UPDATE',
        sourceDomain: 'USERLAND',
        targetDomain: 'SOT',
        hasContract: false,
        hasProvenance: true,
        provenanceMatch: false,
        retryCount: 0,
        maxRetries: 3,
        withinQuota: true,
        anomalyDetected: true
      }
    }
  ]
};