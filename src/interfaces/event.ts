export default interface Event {
  on: string;

  invoke(...args: any[]): Promise<void> | void;
}
