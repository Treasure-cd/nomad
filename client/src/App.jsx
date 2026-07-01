import { useEffect, useState } from "react";
import { getTasks, editTask, getOutbox, deleteTask, addTask } from "./db/tasks"; 
import { syncOutbox } from "./db/sync";

const domainTypes = ["DELIVERY", "HEALTHCARE", "SALES", "OTHER"];

const emptyForm = {
  id: "",
  domainType: "DELIVERY",
  primaryLabel: "",
  secondaryLabel: "",
  lat: 5.03896,
  lng: 7.90947,
  status: "pending",
};

function statusStyles(status) {
  switch (status) {
    case "synced":
      return "bg-green-100 text-green-700 border-green-300";
    case "failed":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-amber-100 text-amber-700 border-amber-300";
  }
}

function actionStyles(method) {
  switch (method) {
    case "POST":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "PUT":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "DELETE":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-neutral-800 text-neutral-300 border-neutral-700";
  }
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data);
  }


  async function loadOutbox() {
    const data = await getOutbox();
    setOutbox(data);
  }

  async function refresh() {
    await loadTasks();
    await loadOutbox();
  }

  function resetForm() {
    setForm({ ...emptyForm, id: `OP-${Math.floor(1000 + Math.random() * 9000)}` });
    setEditingId(null);
  }

  function startEdit(task) {
    setForm(task);
    setEditingId(task.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await editTask(editingId, form); // Fix: changed updateTask to editTask
      } else {
        await addTask(form);
      }

      await refresh();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save locally.");
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteTask(id);
      await refresh();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || "Failed to delete locally.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Nomad — Local Storage Test Console</h1>
          <p className="text-sm text-neutral-400">
            Reads and writes directly to IndexedDB. No network calls — this is
            just to confirm tasks persist locally and actions land in the outbox queue.
          </p>
          <button className="p-4 rounded-md bg-blue-700" onClick={syncOutbox}>
            Sync Outbox
            </button>
        </header>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 h-fit"
          >
            <h2 className="font-medium text-neutral-200">
              {editingId ? `Editing ${editingId}` : "New task"}
            </h2>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Task ID</label>
              <input
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editingId}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                placeholder="OP-8472"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Domain type</label>
              <select
                value={form.domainType}
                onChange={(e) => setForm({ ...form, domainType: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
              >
                {domainTypes.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Primary label</label>
              <input
                value={form.primaryLabel}
                onChange={(e) => setForm({ ...form, primaryLabel: e.target.value })}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                placeholder="Package: Electronics"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Secondary label</label>
              <input
                value={form.secondaryLabel}
                onChange={(e) => setForm({ ...form, secondaryLabel: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                placeholder="Location: Udo Udoma Ave, Uyo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Lat</label>
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Lng</label>
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-neutral-500">
              Status is forced to <span className="font-mono">pending</span> on save — it only
              flips to <span className="font-mono">synced</span> once the real outbox sync
              logic ships.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg px-3 py-2 hover:bg-white transition"
              >
                {editingId ? "Save changes" : "Create task"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm px-3 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Tasks + outbox */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-neutral-400">
                Tasks in IndexedDB ({tasks.length})
              </h2>
              {tasks.length === 0 && (
                <p className="text-sm text-neutral-500">No tasks stored yet.</p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-500">{task.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {task.domainType}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="font-medium text-neutral-100">{task.primaryLabel}</p>
                    <p className="text-sm text-neutral-400">{task.secondaryLabel}</p>
                    <p className="text-xs text-neutral-600">
                      {task.lat}, {task.lng}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(task)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-neutral-400">
                Outbox queue ({outbox.length})
              </h2>
              {outbox.length === 0 && (
                <p className="text-sm text-neutral-500">Nothing queued yet.</p>
              )}
              <div className="space-y-2">
                {outbox.map((entry) => (
                  <div
                    key={entry.id} // Fix: changed from entry.outboxId
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${actionStyles(entry.method)}`} // Fix: changed from entry.action
                      >
                        {entry.method}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 truncate">
                        {entry.url}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-600 shrink-0">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}