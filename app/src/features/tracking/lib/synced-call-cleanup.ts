import { deleteSyncedPendingCallsBehindSweepLine, readLastSweptAt } from '../db';

export async function deleteSyncedCallsBehindSweepLine(): Promise<void> {
  const lastSweptAt = await readLastSweptAt();
  if (lastSweptAt === null) {
    return;
  }
  await deleteSyncedPendingCallsBehindSweepLine(lastSweptAt);
}
