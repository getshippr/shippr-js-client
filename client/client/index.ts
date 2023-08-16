import { pushHttp, pushWs } from "./hosts";
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
): Promise<any> => {
  return new Promise((resolve) => {
    return resolve({});
  });
};

type DataCallBack = (data: any, err: any) => void;

const init = (appId: string, apiKey: string) => {
  return {
    subscribe: async (channelId: string) => {
      const socket = await createSocket(channelId, apiKey, appId);
      return {
        on: (cb: DataCallBack) => {
          socket.addEventListener("message", (event: any) => {
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
          socket.addEventListener("error", (event: any) => {
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
