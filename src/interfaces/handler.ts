export default interface Handler {
  init(...args: any[]): Promise<void> | void;
}
