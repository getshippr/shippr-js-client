import { push, pushHttp, pushWs } from "./hosts";
import ReconnectingWebSocket from "reconnecting-websocket";

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

const createSocket = (channelId: string, apiKey: string, appId: string) => {
  return new ReconnectingWebSocket(
    `${pushWs}?apiKey=${apiKey}&appId=${appId}&channelId=${channelId}`,
    undefined,
    { maxRetries: 5 }
  );
};

type DataCallBack = (data: any, err: any) => void;

const init = (appId: string, apiKey: string) => {
  return {
    subscribe: (channelId: string) => {
      const socket = createSocket(channelId, apiKey, appId);
      return {
        on: (cb: DataCallBack) => {
          socket.addEventListener("message", (event) => {
            if (event.data) {
              const json = JSON.parse(event.data);
              if (json.type === "error") {
                return cb("null", json.message);
              } else {
                return cb(event.data ? JSON.parse(event.data) : "null", null);
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
