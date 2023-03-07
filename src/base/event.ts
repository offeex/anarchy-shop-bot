export default abstract class Event {
  public abstract on: string;

  public abstract execute(...args: any[]): Promise<any> | any;
}
