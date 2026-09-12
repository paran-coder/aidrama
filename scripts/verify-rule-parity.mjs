// Regression guard for the v1.0.1 -> v1.1.0 state model.
// It exhaustively compares the legacy incremental transition semantics with the
// v1.1 reconciliation semantics for success/failure sequences and stage inputs.

function legacyRun(sequence, baseStages) {
  let streak = 0;
  let longest = 0;
  let failures = 0;
  let stageOverride = null;
  let resetCount = 0;
  const snapshots = [];

  sequence.forEach((action, index) => {
    const baseStage = baseStages[index];
    if (action === "S") {
      const hadPenalty = stageOverride !== null;
      streak += 1;
      longest = Math.max(longest, streak);
      failures = 0;
      stageOverride = null;
      snapshots.push([streak, longest, failures, stageOverride, resetCount, hadPenalty ? "recovery" : "none"]);
      return;
    }

    const previousFailures = failures;
    failures = Math.min(failures + 1, 3);
    const currentStage = stageOverride ?? baseStage;
    streak = 0;
    let effect = "none";
    if (failures === 1) {
      stageOverride = Math.max(currentStage - 1, 0);
      effect = "stage_drop";
    } else if (failures === 2) {
      effect = "warning";
    } else if (failures === 3) {
      stageOverride = 0;
      if (previousFailures < 3) {
        resetCount += 1;
        effect = "reset";
      }
    }
    snapshots.push([streak, longest, failures, stageOverride, resetCount, effect]);
  });

  return snapshots;
}

function reconciledRun(sequence, baseStages) {
  let streak = 0;
  let longest = 0;
  let failures = 0;
  let stageOverride = null;
  let resetCount = 0;
  const snapshots = [];

  sequence.forEach((action, index) => {
    const baseStage = baseStages[index];
    let effect = "none";
    if (action === "S") {
      effect = stageOverride !== null ? "recovery" : "none";
      streak += 1;
      longest = Math.max(longest, streak);
      failures = 0;
      stageOverride = null;
    } else {
      streak = 0;
      const currentStage = stageOverride ?? baseStage;
      const previousFailures = failures;
      failures = Math.min(failures + 1, 3);
      if (failures === 1) {
        stageOverride = Math.max(currentStage - 1, 0);
        effect = "stage_drop";
      } else if (failures === 2) {
        effect = "warning";
      } else if (failures === 3) {
        if (previousFailures < 3) {
          resetCount += 1;
          effect = "reset";
        }
        stageOverride = 0;
      }
    }
    snapshots.push([streak, longest, failures, stageOverride, resetCount, effect]);
  });

  return snapshots;
}

function sequences(length, prefix = []) {
  if (prefix.length === length) return [prefix];
  return [...sequences(length, [...prefix, "S"]), ...sequences(length, [...prefix, "F"])];
}

let checked = 0;
for (let length = 1; length <= 10; length += 1) {
  const basePatterns = [
    Array(length).fill(0),
    Array(length).fill(1),
    Array(length).fill(7),
    Array.from({ length }, (_, i) => Math.min(7, Math.floor(i / 2))),
    Array.from({ length }, (_, i) => Math.min(7, 3 + Math.floor(i / 3))),
  ];

  for (const sequence of sequences(length)) {
    for (const bases of basePatterns) {
      checked += 1;
      const legacy = JSON.stringify(legacyRun(sequence, bases));
      const reconciled = JSON.stringify(reconciledRun(sequence, bases));
      if (legacy !== reconciled) {
        console.error("Rule parity mismatch", { sequence, bases, legacy, reconciled });
        process.exit(1);
      }
    }
  }
}

console.log(`Challenge rule parity passed: ${checked.toLocaleString()} cases`);
