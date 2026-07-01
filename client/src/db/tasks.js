import { db } from "./db";

export async function getTasks() {
  return db.tasks.toArray();
}

export async function getOutbox() {
  return db.outbox.toArray();
}


export async function addTask(task) {
  await db.transaction("rw", db.tasks, db.outbox, async () => {
    await db.tasks.add(task);
    await db.outbox.add({
      id: crypto.randomUUID(),
      method: "POST",
      url: "/api/tasks",
      payload: task,
      createdAt: Date.now(),
    });
  });
}

export async function editTask(id, updates) {
  await db.transaction("rw", db.tasks, db.outbox, async () => {
    await db.tasks.update(id, updates);
    
    await db.outbox.add({
      id: crypto.randomUUID(),
      method: "PUT",
      url: `/api/tasks/${id}`,
      payload: updates,
      createdAt: Date.now(),
    });
  });
}

export async function deleteTask(id) {
  await db.transaction("rw", db.tasks, db.outbox, async () => {
    await db.tasks.delete(id);
    await db.outbox.add({
      id: crypto.randomUUID(),
      method: "DELETE",
      url: `/api/tasks/${id}`,
      createdAt: Date.now(),
    });
  });
}