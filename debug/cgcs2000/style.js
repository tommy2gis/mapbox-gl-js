var style={
    "version": 8,
    "metadata": {},
    "sources": {
        tianditu: {
            type: 'raster',
            tiles: ['http://t0.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=5476e03145570ac8182560f41a1e538b'],
            tileSize: 256
        },
      "block": {
        "type": "vector",
        "scheme": "xyz",
        "zoomOffset": -1,
        "tiles": [
          "http://localhost:8088/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=swsk:block&STYLE=&TILEMATRIX=EPSG:4326:{z}&TILEMATRIXSET=EPSG:4326&FORMAT=application/x-protobuf;type=mapbox-vector&TILECOL={x}&TILEROW={y}"
        ]
      }
    
    },
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    "layers": [
      {
        "id": "background",
        "type": "background",
        "layout": {"visibility": "visible"},
        "paint": {"background-color": "#F1F6F9"}
      },
      {
        id: 'tianditu',
        type: 'raster',
        source: 'tianditu'
    },
    {
        "id": "landuse-residential-4",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_YuanL4_A",
        "minzoom": 14,
        "layout": {"visibility": "visible"},
        "paint": {
          "fill-color": {
            "base": 1,
            "stops": [
              [12, "hsla(30, 19%, 90%, 0.6)"],
              [20, "hsla(30, 19%, 90%, 0.4)"]
            ]
          },
          "fill-outline-color": "#EEECE7"
        }
      },
      {
        "id": "landuse-residential-3",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_YuanL3_A",
        "minzoom": 14,
        "layout": {"visibility": "visible"},
        "paint": {
          "fill-color": {
            "base": 1,
            "stops": [
              [12, "hsla(30, 19%, 90%, 0.6)"],
              [20, "hsla(30, 19%, 90%, 0.4)"]
            ]
          },
          "fill-outline-color": "#EEECE7"
        }
      },
      {
        "id": "landuse-residential-2",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_YuanL2_A",
        "minzoom": 14,
        "layout": {"visibility": "visible"},
        "paint": {
          "fill-color": {
            "base": 1,
            "stops": [
              [12, "hsla(30, 19%, 90%, 0.6)"],
              [20, "hsla(30, 19%, 90%, 0.4)"]
            ]
          },
          "fill-outline-color": "#EEECE7"
        }
      },
      {
        "id": "landuse-residential",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_YuanL1_A",
        "minzoom": 14,
        "layout": {"visibility": "visible"},
        "paint": {
          "fill-color": {
            "base": 1,
            "stops": [
              [12, "hsla(30, 19%, 90%, 0.6)"],
              [20, "hsla(30, 19%, 90%, 0.4)"]
            ]
          },
          "fill-outline-color": "#EEECE7"
        }
      },
      {
        "id": "landuse-hospital",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_YiLiao_A",
        "minzoom": 13,
        "filter": ["all", ["==", "$type", "Polygon"]],
        "paint": {"fill-color": "#EBD8DE"}
      },
      {
        "id": "landuse-business",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_ShangYe_A",
        "minzoom": 13,
        "filter": ["all", ["==", "$type", "Polygon"]],
        "paint": {"fill-color": "#E9E0ED"}
      },
      {
        "id": "landuse-commercial",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_ShangYe_A",
        "filter": ["all"],
        "layout": {"visibility": "none"},
        "paint": {"fill-color": "hsla(0, 60%, 87%, 0.23)"}
      },
      {
        "id": "landuse-school",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "JMD_JiaoYu_A",
        "minzoom": 13,
        "filter": ["all", ["==", "$type", "Polygon"]],
        "layout": {"visibility": "visible"},
        "paint": {"fill-color": "#DCEAF0"}
      },
      
      {
        "id": "green-copy",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "ZB_NLLD_A",
        "minzoom": 0,
        "filter": ["all"],
        "layout": {"visibility": "visible"},
        "paint": {"fill-color": "#CFE8A7"}
      },
      {
        "id": "green",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "ZB_CSLD_A",
        "minzoom": 16,
        "maxzoom": 24,
        "filter": ["all"],
        "layout": {"visibility": "visible"},
        "paint": {"fill-color": "#CFE8A7"}
      },
      {
        "id": "water-lake-2",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "湖泊面",
        "filter": ["all", ["==", "$type", "Polygon"]],
        "paint": {"fill-color": "#ADD2FF"}
      },
      {
        "id": "water-lake-copy",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "SX_HuPo_A",
        "filter": ["all", ["==", "$type", "Polygon"]],
        "paint": {"fill-color": "#ADD2FF"}
      },
      {
        "id": "water-lake",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "池塘面",
        "minzoom": 12,
        "filter": ["all", ["==", "$type", "Polygon"]],
        "layout": {"visibility": "visible"},
        "paint": {"fill-color": "#ADD2FF"}
      },
      {
        "id": "water-river-copy",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "SX_HeLiu_A",
        "minzoom": 8,
        "filter": ["all", ["==", "$type", "Polygon"]],
        "paint": {"fill-color": "#ADD2FF"}
      },
      {
        "id": "water-river",
        "type": "fill",
        "metadata": {"mapbox:group": "1444849388993.3071"},
        "source": "block",
        "source-layer": "河流面",
        "minzoom": 8,
        "filter": ["all", ["==", "$type", "Polygon"], ["!=", "NAME", ""]],
        "paint": {"fill-color": "#ADD2FF"}
      }
    ],
    "id": "hrmq9na14"
  }