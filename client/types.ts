import SuperSocket from "@shippr/supersocket";

export type DataCallBack = (data: any, err: any) => void;
export type ShipprClient = {
  subscribe: (channelId: string) => Promise<ShipprSub>;
  publish: (channelId: string, data: any) => Promise<Response>;
};
export type ShipprSub = {
  on: (cb: DataCallBack) => void;
  getSocket: () => SuperSocket;
  disconnect: () => void;
};
