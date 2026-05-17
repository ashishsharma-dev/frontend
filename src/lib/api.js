import axios from "axios";

function getBackendBase() {
  const configuredBase = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
  if (configuredBase) return configuredBase;

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:8001`;
    }
  }

  return "";
}

const BASE = getBackendBase();
export const API = BASE ? `${BASE}/api` : "/api";

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (typeof detail?.msg === "string") return detail.msg;
  return String(detail);
}
