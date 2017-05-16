export const Config = {
  websocket: {
    port: 7777
  },
  stream: {
    port: {
      websocket: 7778,
      http: 8080
    },
    recording: false,
    maxClients: 1
  }
};
