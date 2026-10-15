const memory = new Map();
const pendingMemory = new Set();
export function read(key, fallback, validate = () => true) {
  let raw;
  try {
    raw = pendingMemory.has(key)
      ? memory.get(key)
      : (localStorage.getItem(key) ?? memory.get(key));
  } catch {
    raw = memory.get(key);
  }
  try {
    if (raw == null) return fallback;
    const value = JSON.parse(raw);
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function write(key, value) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    localStorage.setItem(key, raw);
    pendingMemory.delete(key);
    return true;
  } catch {
    pendingMemory.add(key);
    return false;
  }
}
export const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function downloadText(name, text, type = "text/markdown;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
