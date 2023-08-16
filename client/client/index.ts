import { push, pushHttp, pushWs } from "./hosts";
import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";

const publish = async (
  appId: string,
  apiKey: string,
  channelId: string,
  data: any
) => {
  return fetch(
    `${pushHttp}/hooks/${channelId}?apiKey=${apiKey}&appId=${appId}`,
    {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data || {}),
    }
  );
};

const createSocket = (
  channelId: string,
  apiKey: string,
  appId: string
): Promise<ReconnectingWebSocket> => {
  return new Promise((resolve) => {
    const wsOption: any = {};
    if (typeof window === "undefined") {
      wsOption.WebSocket = WS;
    }
    const socket = new ReconnectingWebSocket(
      `${pushWs}?apiKey=${apiKey}&appId=${appId}&channelId=${channelId}`,
      [],
      { maxRetries: 10, minReconnectionDelay: 1, ...wsOption }
    );
    socket.addEventListener("open", (event) => {
      return resolve(socket);
    });
  });
};

type DataCallBack = (data: any, err: any) => void;

const init = (appId: string, apiKey: string) => {
  return {
    subscribe: async (channelId: string) => {
      const socket = await createSocket(channelId, apiKey, appId);
      return {
        on: (cb: DataCallBack) => {
          socket.addEventListener("message", (event) => {
            if (event.data) {
              const json = JSON.parse(event.data);
              if (json.type === "error") {
                return cb("null", json.message);
              } else {
                return cb(json, null);
              }
            } else {
              return cb("null", null);
            }
          });
          socket.addEventListener("error", (event) => {
            return cb("null", "internal websocket error");
          });
        },
      };
    },
    publish: (channelId: string, data: any) => {
      return publish(appId, apiKey, channelId, data);
    },
  };
};

export { init };
