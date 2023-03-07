export default interface Initiable {
  init(...args: any[]): Promise<any> | any;
}
