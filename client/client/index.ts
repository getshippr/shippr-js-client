import { SuperSocketOptions } from "@shippr/supersocket/lib/esm/types/supersocket";
import { pushHttp, pushWs } from "./hosts";
import SuperSocket from "@shippr/supersocket";

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

const createSocket = (options?: SuperSocketOptions): Promise<SuperSocket> => {
  return new Promise((resolve) => {
    const socket = new SuperSocket(pushWs, [], options);
    socket.onopen = (event) => {
      return resolve(socket);
    };
  });
};

type DataCallBack = (data: any, err: any) => void;

const init = (
  appId: string,
  apiKey: string,
  options?: { wsOptions?: SuperSocketOptions; userId?: string }
) => {
  return {
    subscribe: async (channelId: string) => {
      const queryParams: any = { channelId, apiKey, appId };
      if (options?.userId) {
        queryParams.userId = options?.userId;
      }
      const socket = await createSocket(
        Object.assign(options?.wsOptions || {}, {
          queryParams,
        })
      );
      return {
        on: (cb: DataCallBack) => {
          socket.onmessage = (event) => {
            const data = event.data ? JSON.parse(`${event.data}`) : null;
            if (data.type === "error") {
              return cb(null, data.message);
            } else {
              return cb(data, null);
            }
          };
          socket.onerror = (event) => {
            cb(null, event.message);
          };
        },
        getSocket: (): SuperSocket => {
          return socket;
        },
        disconnect: (): void => {
          if (socket.close) {
            return socket.close();
          }
        },
      };
    },
    publish: (channelId: string, data: any) => {
      return publish(appId, apiKey, channelId, data);
    },
  };
};
export { init };
