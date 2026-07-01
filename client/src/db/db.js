import Dexie from "dexie";

export const db = new Dexie("NomadDB");

db.version(1).stores({
  tasks: `
    id,
    domainType,
    primaryLabel,
    secondaryLabel,
    status
  `,
  outbox: `
    id,
    method,
    url,
    createdAt
  `,
});