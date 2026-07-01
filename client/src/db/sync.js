import apiRequest from "../lib/fetch";
import { getOutbox } from "./tasks";
import { db } from "./db";

export async function syncOutbox() {
    const outboxItems = await getOutbox();
    outboxItems.sort((a, b) => a.createdAt - b.createdAt);

    for (const entry of outboxItems) {
        try {
            await apiRequest(entry.url, entry.method, entry.payload);

            await db.transaction("rw", db.tasks, db.outbox, async () => {
                await db.outbox.delete(entry.id);
                if (entry.method !== 'DELETE') {
                    const taskId = entry.method === 'POST' 
                        ? entry.payload.id 
                        : entry.url.split('/').pop();
                    const task = await db.tasks.get(taskId);
                    if (task) {
                        await db.tasks.update(taskId, { status: "synced" });
                    }
                }
            });

        } catch (e) {
            console.error(`Sync stopped at ${entry.id}. Reason:`, e.message);
            break; 
        }
    }
}