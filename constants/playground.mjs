export const PLAYGROUND_HOST = "127.0.0.1";
export const PLAYGROUND_PORT = Number(process.env.PLAYGROUND_PORT ?? 4173);
export const PLAYGROUND_URL = `http://${PLAYGROUND_HOST}:${PLAYGROUND_PORT}/`;
