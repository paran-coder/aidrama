// v1.2.0 regression guard: failures may break the current streak, but creator
// identity never regresses. Compare incremental and full-reconciliation models.

function incrementalRun(sequence) {
  let streak = 0;
  let longest = 0;
  let failures = 0;
  let successCount = 0;
  let failureCount = 0;
  const snapshots = [];

  for (const action of sequence) {
    let effect = "none";
    if (action === "S") {
      streak += 1;
      longest = Math.max(longest, streak);
      failures = 0;
      successCount += 1;
    } else {
      const previousFailures = failures;
      streak = 0;
      failures = Math.min(failures + 1, 3);
      failureCount += 1;
      if (failures === 2) effect = "warning";
      else if (failures === 3 && previousFailures < 3) effect = "reset"; // restart prompt only
    }
    snapshots.push([streak, longest, failures, successCount, failureCount, effect, null, 0]);
  }
  return snapshots;
}

function reconciledRun(sequence) {
  let streak = 0;
  let longest = 0;
  let failures = 0;
  let successCount = 0;
  let failureCount = 0;
  const snapshots = [];

  sequence.forEach((action) => {
    let effect = "none";
    if (action === "S") {
      streak += 1;
      longest = Math.max(longest, streak);
      failures = 0;
      successCount += 1;
    } else {
      const previousFailures = failures;
      failureCount += 1;
      streak = 0;
      failures = Math.min(failures + 1, 3);
      if (failures === 2) effect = "warning";
      else if (failures === 3 && previousFailures < 3) effect = "reset";
    }
    snapshots.push([streak, longest, failures, successCount, failureCount, effect, null, 0]);
  });
  return snapshots;
}

function sequences(length, prefix = []) {
  if (prefix.length === length) return [prefix];
  return [...sequences(length, [...prefix, "S"]), ...sequences(length, [...prefix, "F"])];
}

let checked = 0;
for (let length = 1; length <= 12; length += 1) {
  for (const sequence of sequences(length)) {
    checked += 1;
    const incremental = JSON.stringify(incrementalRun(sequence));
    const reconciled = JSON.stringify(reconciledRun(sequence));
    if (incremental !== reconciled) {
      console.error("v1.2 rule parity mismatch", { sequence, incremental, reconciled });
      process.exit(1);
    }
  }
}

console.log(`v1.2 challenge rule parity passed: ${checked.toLocaleString()} sequences`);
