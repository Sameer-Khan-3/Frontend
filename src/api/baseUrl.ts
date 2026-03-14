const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
const fromPort = import.meta.env.VITE_API_PORT as string | undefined;

const fromWindow =
  fromPort && fromPort.trim()
    ? `${window.location.protocol}//${window.location.hostname}:${fromPort}/api`
    : `${window.location.origin}/api`;

export const API_BASE_URL =
  fromEnv && fromEnv.trim() ? fromEnv : fromWindow;
