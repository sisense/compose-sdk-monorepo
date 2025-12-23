export interface CustomScrollI {
  scrollLeft(left: number): void;
  scrollTop(top: number): void;
  update(callback: Function): void;
}
