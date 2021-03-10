// @flow

import type {CircleDefinesType} from './circle_program';
import type {SymbolDefinesType} from './symbol_program';
import {fillExtrusionUniforms, fillExtrusionPatternUniforms} from './fill_extrusion_program';
import {fillUniforms, fillPatternUniforms, fillWaterUniforms,fillOutlineUniforms, fillOutlinePatternUniforms} from './fill_program';
import {circleUniforms} from './circle_program';
import {collisionUniforms, collisionCircleUniforms} from './collision_program';
import {debugUniforms} from './debug_program';
import {clippingMaskUniforms} from './clipping_mask_program';
import {heatmapUniforms, heatmapTextureUniforms} from './heatmap_program';
import {hillshadeUniforms, hillshadePrepareUniforms} from './hillshade_program';
import {lineUniforms, lineGradientUniforms, linePatternUniforms, lineSDFUniforms} from './line_program';
import {rasterUniforms} from './raster_program';
import {symbolIconUniforms, symbolSDFUniforms, symbolTextAndIconUniforms} from './symbol_program';
import {backgroundUniforms, backgroundPatternUniforms} from './background_program';
import {terrainRasterUniforms} from '../../terrain/terrain_raster_program';
import {skyboxUniforms, skyboxGradientUniforms} from './skybox_program';
import {skyboxCaptureUniforms} from './skybox_capture_program';

export type DynamicDefinesType = CircleDefinesType | SymbolDefinesType;

export const programUniforms = {
    fillExtrusion: fillExtrusionUniforms,
    fillExtrusionPattern: fillExtrusionPatternUniforms,
    fill: fillUniforms,
    fillWater: fillWaterUniforms,
    fillPattern: fillPatternUniforms,
    fillOutline: fillOutlineUniforms,
    fillOutlinePattern: fillOutlinePatternUniforms,
    circle: circleUniforms,
    collisionBox: collisionUniforms,
    collisionCircle: collisionCircleUniforms,
    debug: debugUniforms,
    clippingMask: clippingMaskUniforms,
    heatmap: heatmapUniforms,
    heatmapTexture: heatmapTextureUniforms,
    hillshade: hillshadeUniforms,
    hillshadePrepare: hillshadePrepareUniforms,
    line: lineUniforms,
    lineGradient: lineGradientUniforms,
    linePattern: linePatternUniforms,
    lineSDF: lineSDFUniforms,
    raster: rasterUniforms,
    symbolIcon: symbolIconUniforms,
    symbolSDF: symbolSDFUniforms,
    symbolTextAndIcon: symbolTextAndIconUniforms,
    background: backgroundUniforms,
    backgroundPattern: backgroundPatternUniforms,
    terrainRaster: terrainRasterUniforms,
    terrainDepth: terrainRasterUniforms,
    skybox: skyboxUniforms,
    skyboxGradient: skyboxGradientUniforms,
    skyboxCapture: skyboxCaptureUniforms
};
