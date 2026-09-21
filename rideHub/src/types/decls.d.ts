declare module "canvas-confetti";

declare module "leaflet" {
  const L: any;
  export default L;
}

declare namespace L {
  export type Map = any;
  export type Marker = any;
  export type Polyline = any;
  export type Circle = any;
}
