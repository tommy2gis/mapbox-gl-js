// @flow

import LngLatBounds from '../geo/lng_lat_bounds.js';
import {mercatorXfromLng, mercatorYfromLat,mercatorYfrom2000Lat} from '../geo/mercator_coordinate.js';

import type {CanonicalTileID} from './tile_id.js';

class TileBounds {
    bounds: LngLatBounds;
    minzoom: number;
    maxzoom: number;

    constructor(bounds: [number, number, number, number], minzoom: ?number, maxzoom: ?number,crs: ?string) {
        this.bounds = LngLatBounds.convert(this.validateBounds(bounds));
        this.minzoom = minzoom || 0;
        this.maxzoom = maxzoom || 24;
        this.crs = crs || 'EPSG:3857';
        console.log('TileBounds:'+this.crs);
    }

    validateBounds(bounds: [number, number, number, number]) {
        // make sure the bounds property contains valid longitude and latitudes
        if (!Array.isArray(bounds) || bounds.length !== 4) return [-180, -90, 180, 90];
        return [Math.max(-180, bounds[0]), Math.max(-90, bounds[1]), Math.min(180, bounds[2]), Math.min(90, bounds[3])];
    }

    contains(tileID: CanonicalTileID) {
        const worldSize = Math.pow(2, tileID.z);
        const level = {
            minX: Math.floor(mercatorXfromLng(this.bounds.getWest()) * worldSize),
            minY: Math.floor((this.crs==='EPSG:4490'?mercatorYfrom2000Lat(this.bounds.getNorth()):mercatorYfromLat(this.bounds.getNorth())) * worldSize),
            maxX: Math.ceil(mercatorXfromLng(this.bounds.getEast()) * worldSize),
            maxY: Math.ceil((this.crs==='EPSG:4490'?mercatorYfrom2000Lat(this.bounds.getSouth()) :mercatorYfromLat(this.bounds.getSouth())) * worldSize)
        };
        const hit = tileID.x >= level.minX && tileID.x < level.maxX && tileID.y >= level.minY && tileID.y < level.maxY;
        return hit;
    }
}

export default TileBounds;
