// d3-geo-projection and versor ship no types and have no @types package on npm.
// Declared here so the geo charts stay strict-mode clean without reaching for `any`.

declare module 'd3-geo-projection' {
  import type { GeoProjection, GeoPermissibleObjects, GeoRawProjection } from 'd3-geo';

  export function geoAitoff(): GeoProjection;
  export function geoBaker(): GeoProjection;
  export function geoBerghaus(): GeoProjection;
  export function geoBoggs(): GeoProjection;
  export function geoEckert4(): GeoProjection;
  export function geoGinzburg8(): GeoProjection;
  export function geoHammer(): GeoProjection;
  export function geoInterruptedHomolosine(): GeoProjection;
  export function geoInterruptedMollweide(): GeoProjection;
  export function geoMollweide(): GeoProjection;
  export function geoPeirceQuincuncial(): GeoProjection;
  export function geoPolyhedralWaterman(): GeoProjection;
  export function geoRobinson(): GeoProjection;
  export function geoSinusoidal(): GeoProjection;
  export function geoWinkel3(): GeoProjection;

  // Raw projections, for interpolating between two projections point by point. Unlike the
  // d3-geo core raws, these are values rather than zero-argument factories.
  export const geoAitoffRaw: GeoRawProjection;
  export const geoBoggsRaw: GeoRawProjection;
  export const geoEckert4Raw: GeoRawProjection;
  export const geoKavrayskiy7Raw: GeoRawProjection;
  export const geoMollweideRaw: GeoRawProjection;
  export const geoNaturalEarth2Raw: GeoRawProjection;
  export const geoRobinsonRaw: GeoRawProjection;
  export const geoSinusoidalRaw: GeoRawProjection;
  export const geoWinkel3Raw: GeoRawProjection;
  export function geoHammerRaw(A: number, B?: number): GeoRawProjection;

  /** Rewinds and stitches antimeridian-crossing geometry so it renders without artifacts. */
  export function geoStitch<T extends GeoPermissibleObjects>(object: T): T;
  export function geoProject<T extends GeoPermissibleObjects>(
    object: T,
    projection: GeoProjection
  ): T | null;
  export function geoQuantize<T extends GeoPermissibleObjects>(object: T, digits: number): T;
}

declare module 'versor' {
  type Quaternion = [number, number, number, number];
  type Cartesian = [number, number, number];
  type Rotation = [number, number, number];

  interface Versor {
    (angles: Rotation): Quaternion;
    cartesian(spherical: [number, number]): Cartesian;
    rotation(quaternion: Quaternion): Rotation;
    delta(v0: Cartesian, v1: Cartesian, alpha?: number): Quaternion;
    multiply(a: Quaternion, b: Quaternion): Quaternion;
    /** Spherical linear interpolation between two Euler rotations. */
    interpolate(a: Rotation, b: Rotation): (t: number) => Rotation;
  }

  const versor: Versor;
  export default versor;
}
