import SuperSocket from "@shippr/supersocket";

export type DataCallBack = (data: any, err: any) => void;
export type ShipprClient = {
  /**
   * Subscribe to a specific channel
   * ex
   * const watcher = await subscribe('my-channel')
   * watcher.on((data, err) => {
   *  doSomething()
   * })
   **/
  subscribe: (channelId: string) => Promise<ShipprSub>;
  /**
   * Send a POST query with data and will publish message to ALL subscribers
   **/
  publish: (channelId: string, data: any) => Promise<Response>;
};
export type ShipprSub = {
  on: (cb: DataCallBack) => void;
  getSocket: () => SuperSocket;
  disconnect: () => void;
  /**
   * emit data to only the current socket
   **/
  emit: (data: any) => void;
  /**
   * broadcast data to all subscribers
   **/
  broadcast: (data: any) => void;
};
