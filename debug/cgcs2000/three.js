window.GeoGlobe = {
    singleFile: true
};

(function(){
	GeoGlobe.DOM = GeoGlobe.DOM || {};
	GeoGlobe.DOM.create = function (tagName, className, container) {
	    var el = window.document.createElement(tagName);
	    if (className) el.className = className;
	    if (container) container.appendChild(el);
	    return el;
	};
	
	var docStyle = window.document.documentElement.style;
	
	function testProp(props) {
	    for (var i = 0; i < props.length; i++) {
	        if (props[i] in docStyle) {
	            return props[i];
	        }
	    }
	    return props[0];
	}
	
	var selectProp = testProp(['userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect']),
	    userSelect;
	GeoGlobe.DOM.disableDrag = function () {
	    if (selectProp) {
	        userSelect = docStyle[selectProp];
	        docStyle[selectProp] = 'none';
	    }
	};
	GeoGlobe.DOM.enableDrag = function () {
	    if (selectProp) {
	        docStyle[selectProp] = userSelect;
	    }
	};
	
	var transformProp = testProp(['transform', 'WebkitTransform']);
	GeoGlobe.DOM.setTransform = function(el, value) {
	    el.style[transformProp] = value;
	};
	
	// Suppress the next click, but only if it's immediate.
	function suppressClick(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    window.removeEventListener('click', suppressClick, true);
	}
	GeoGlobe.DOM.suppressClick = function() {
	    window.addEventListener('click', suppressClick, true);
	    window.setTimeout(function() {
	        window.removeEventListener('click', suppressClick, true);
	    }, 0);
	};
	
	GeoGlobe.DOM.mousePos = function (el, e) {
	    var rect = el.getBoundingClientRect();
	    e = e.touches ? e.touches[0] : e;
	    return new Point(
	        e.clientX - rect.left - el.clientLeft,
	        e.clientY - rect.top - el.clientTop
	    );
	};
	
	GeoGlobe.DOM.touchPos = function (el, e) {
	    var rect = el.getBoundingClientRect(),
	        points = [];
	    var touches = (e.type === 'touchend') ? e.changedTouches : e.touches;
	    for (var i = 0; i < touches.length; i++) {
	        points.push(new Point(
	            touches[i].clientX - rect.left - el.clientLeft,
	            touches[i].clientY - rect.top - el.clientTop
	        ));
	    }
	    return points;
	};
	
	GeoGlobe.DOM.remove = function(node) {
	    if (node.parentNode) {
	        node.parentNode.removeChild(node);
	    }
	};
})();

GeoGlobe.Util = GeoGlobe.Util || {};
GeoGlobe.Util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }

        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if (!sourceIsEvt
           && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

GeoGlobe.inherit = function(C, P) {
    var F = function() {};
    F.prototype = P.prototype;
    C.prototype = new F;
    var i, l, o;
    for(i=2, l=arguments.length; i<l; i++) {
        o = arguments[i];
        if(typeof o === "function") {
            o = o.prototype;
        }
        GeoGlobe.Util.extend(C.prototype, o);
    }
 };

GeoGlobe.Util.lastSeqID = 0;

GeoGlobe.Util.createUniqueID = function(prefix) {
    if (prefix == null) {
        prefix = "id_";
    } else {
        prefix = prefix.replace(GeoGlobe.Util.dotless, "_");
    }
    GeoGlobe.Util.lastSeqID += 1; 
    return prefix + GeoGlobe.Util.lastSeqID;        
};


GeoGlobe.Class = function() {
    var len = arguments.length;
    var P = arguments[0];
    var F = arguments[len-1];

    var C = typeof F.initialize == "function" ?
        F.initialize :
        function(){ P.prototype.initialize.apply(this, arguments); };

    if (len > 1) {
        var newArgs = [C, P].concat(
                Array.prototype.slice.call(arguments).slice(1, len-1), F);
        //GeoGlobe.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};

GeoGlobe.Class4OL = function() {
    var len = arguments.length;
    var P = arguments[0];
    var F = arguments[len-1];

    var C = typeof F.initialize == "function" ?
        F.initialize :
        function(){ P.prototype.initialize.apply(this, arguments); };

    if (len > 1) {
        var newArgs = [C, P].concat(
                Array.prototype.slice.call(arguments).slice(1, len-1), F);
        GeoGlobe.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};




GeoGlobe.Function = {

    bind: function(func, object) {
        // create a reference to all arguments past the second one
        var args = Array.prototype.slice.apply(arguments, [2]);
        return function() {
            // Push on any additional arguments from the actual function call.
            // These will come after those sent to the bind call.
            var newArgs = args.concat(
                Array.prototype.slice.apply(arguments, [0])
            );
            return func.apply(object, newArgs);
        };
    },
    
    bindAsEventListener: function(func, object) {
        return function(event) {
            return func.call(object, event || window.event);
        };
    },
    
    False : function() {
        return false;
    },

    True : function() {
        return true;
    },
    
    Void: function() {}

};

GeoGlobe.ElementContainer = GeoGlobe.Class4OL({
    id: null,
    map: null,
    initialize: function (a) {
        this.id = GeoGlobe.Util.createUniqueID(this.CLASS_NAME + "_");
        GeoGlobe.Util.extend(this, a);
    },
    addTo: function (map) {
        this.map = map;
        var canvascontainer = map.getCanvasContainer();
        if (!map.eleContainer)
            (canvascontainer = GeoGlobe.DOM.create("div", "geoglobe-element-container", canvascontainer)),
                (canvascontainer.style.width = map.getCanvas().style.width),
                (canvascontainer.style.height = map.getCanvas().style.height),
                (canvascontainer.style.position = "absolute"),
                (map.eleContainer = canvascontainer);
        this.container = GeoGlobe.DOM.create("div", null, map.eleContainer);
        this.container.style.width = map.getCanvas().style.width;
        this.container.style.height = map.getCanvas().style.height;
        this.container.style.position = "absolute";
        this._resize = GeoGlobe.Function.bind(this._resize, this);
        map.on("resize", this._resize);
    },
    _resize: function () {
        var map = this.map;
        map.eleContainer.style.width = map.getCanvas().style.width;
        map.eleContainer.style.height = map.getCanvas().style.height;
        this.container.style.width = map.getCanvas().style.width;
        this.container.style.height = map.getCanvas().style.height;
    },
    getElMap: function () {
        return this.elmap;
    },
    remove: function () {
        this.map.off("resize", this._resize);
    },
    CLASS_NAME: "GeoGlobe.ElementContainer",
});


GeoGlobe.Visuals = GeoGlobe.Class4OL(GeoGlobe.ElementContainer, {
    initialize: function () {
        GeoGlobe.ElementContainer.prototype.initialize.apply(this, arguments);
    },
    addTo: function (a) {
        a._visuals = a._visuals || [];
        a._visuals.push(this);
        GeoGlobe.ElementContainer.prototype.addTo.apply(this, arguments);
    },
    remove: function () {
        var a = this.map;
        a._visuals.splice(a._visuals.indexOf(this), 1);
        a.eleContainer.removeChild(this.container);
        GeoGlobe.ElementContainer.prototype.remove.apply(this, arguments);
    },
});
GeoGlobe.Visuals = GeoGlobe.Class4OL(GeoGlobe.Visuals, mapboxgl.Evented);

GeoGlobe.Visuals.Three = GeoGlobe.Class4OL(GeoGlobe.Visuals, {
    type: "three",
    map: null,
    container: null,
    layers: [],
    _threebox: null,
    _raycaster: null,
    _raycAsix: null,
    initialize: function () {
        GeoGlobe.Visuals.prototype.initialize.apply(this, arguments);
        this.layers = [];
        !window.THREE || !window.Threebox
            ? console.error(
                  "使用three可视化图层前，需引入threejs库！"
              )
            : ((this._raycaster = new THREE.Raycaster()),
              (this._raycAsix = new THREE.Vector2()));
    },
    addTo: function (a, b) {
        GeoGlobe.Visuals.prototype.addTo.apply(this, arguments);
        this.container.className = "geoglobe-three-container";
        this._threebox = new Threebox(this.map, b ? b : this.container);
        this._threebox.setupDefaultLights();
        this._bindEvent();
    },
    render: function () {
        if (this._order)
            for (var a = 0; a < this._order.length; a++)
                for (var b = 0; b < this.layers.length; b++)
                    this.layers[b].id === this._order[a] &&
                        this.layers[b].render();
        else for (b = 0; b < this.layers.length; b++) this.layers[b].render();
        this._render();
    },
    _render: function () {
        this._threebox.mapContext &&
        this._threebox.mapContext instanceof WebGLRenderingContext
            ? this.map.triggerRepaint()
            : this._threebox.render();
    },
    addLayer: function (a) {
        a.id
            ? this.map.getLayer(a.id)
                ? console.error(
                      "\u56fe\u5c42id\u5c5e\u6027\u4e0d\u80fd\u91cd\u590d\uff01"
                  )
                : this.layers.push(a)
            : console.error(
                  "\u56fe\u5c42id\u5c5e\u6027\u4e0d\u80fd\u4e3a\u7a7a\uff01"
              );
    },
    removeLayer: function (a) {
        for (var b = [], c = 0; c < this.layers.length; c++)
            a === this.layers[c].id
                ? this._removeInnerLayer(this.layers[c])
                : b.push(this.layers[c]);
        this.layers = b;
        this._render();
    },
    moveLayer: function (a, b) {
        this._order = this.layers.map(function (a) {
            return a.id;
        });
        this._order.splice(this._order.indexOf(a), 1);
        this._order.splice(
            b ? this._order.indexOf(b) : this._order.length,
            0,
            a
        );
        this.render();
    },
    _removeInnerLayer: function (a) {
        if (a._meshes && a._meshes instanceof Array && a._meshes.length > 0)
            for (var b = 0; b < a._meshes.length; b++) {
                for (var c = 0; c < this._threebox.world.children.length; c++)
                    if (
                        this._threebox.world.children[c].children.length !==
                            0 &&
                        this._threebox.world.children[c].children[0].uuid ===
                            a._meshes[b].uuid
                    ) {
                        this._threebox.world.remove(a._meshes[b].parent);
                        break;
                    }
                for (c = 0; c < this._threebox.world2.children.length; c++)
                    if (
                        this._threebox.world2.children[c].children.length !==
                            0 &&
                        this._threebox.world2.children[c].children[0].uuid ===
                            a._meshes[b].uuid
                    ) {
                        this._threebox.world2.remove(a._meshes[b].parent);
                        break;
                    }
            }
    },
    getLayer: function (a) {
        for (var b = 0; b < this.layers.length; b++)
            if (a === this.layers[b].id) return this.layers[b];
    },
    unprojectFromWorld: function (a) {
        var b = new THREE.Matrix4();
        b.getInverse(this._threebox.world.matrixWorld);
        return this._threebox.unprojectFromWorld(a.applyMatrix4(b));
    },
    _bindEvent: function () {
        var a = this;
        this.map.on("click", function (b) {
            a._onClick(b);
        });
        this.map.on("mousemove", function (b) {
            a._onMouseMove(b);
        });
    },
    _unbindEvent: function () {
        for (var a = 0; a < this.map._listeners.click.length; a++)
            this.map._listeners.click[a].name &&
                this.map._listeners.click[a].name === "THREE_CLICK_EVENT" &&
                this.map._listeners.click.splice(a, 1);
        for (a = 0; a < this.map._listeners.mousemove.length; a++)
            this.map._listeners.mousemove[a].name &&
                this.map._listeners.mousemove[a].name ===
                    "THREE_MOUSEMOVE_EVENT" &&
                this.map._listeners.mousemove.splice(a, 1);
    },
    _onMouseMove: function (a) {
        var b = this._computerIntersect(a);
        b.length > 0 &&
            this.fire("overlayerhover", {
                param: {
                    info: this._getSymbolObject(b[0].object),
                    pickedInfos: b,
                    event: a,
                },
            });
    },
    _onClick: function (a) {
        var b = this._computerIntersect(a);
        b.length > 0 &&
            this.fire("overlayerclick", {
                param: {
                    info: this._getSymbolObject(b[0].object),
                    pickedInfos: b,
                    event: a,
                },
            });
    },
    _computerIntersect: function (a) {
        this._raycAsix.x =
            ((a.originalEvent.pageX - this.container.offsetLeft) /
                this.container.offsetWidth) *
                2 -
            1;
        this._raycAsix.y =
            -(
                (a.originalEvent.pageY - this.container.offsetTop) /
                this.container.offsetHeight
            ) *
                2 +
            1;
        this._raycaster.setFromCamera(this._raycAsix, this._threebox.camera);
        return this._raycaster.intersectObjects(
            this._threebox.scene.children,
            !0
        );
    },
    _getSymbolObject: function (a) {
        if (!a || !a.userData) return a;
        return a.userData.attributes ? a : this._getSymbolObject(a.parent);
    },
    remove: function () {
        if (this.container) {
            for (; this.layers.length; )
                this.removeLayer(this.layers[this.layers.length - 1].id);
            GeoGlobe.Visuals.prototype.remove.apply(this);
            for (var a in this._listeners)
                this._listeners.hasOwnProperty(a) &&
                    (this.off(a, this._listeners[a]),
                    delete this._listeners[a]);
            this._unbindEvent();
            this.container = this.map = null;
            this.layers = [];
            this._order = [];
            this._raycAsix = this._raycaster = this._threebox = null;
        }
    },
});
GeoGlobe.Visuals.Three.Base = GeoGlobe.Class({
    id: null,
    _three: null,
    _meshes: null,
    initialize: function (a) {
        this.id = a.id || "three" + GeoGlobe.Util.randomStr(6);
        this._meshes = [];
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        throw "\u8bf7\u5b9e\u73b0\u8be5\u65b9\u6cd5";
    },
});
GeoGlobe.Visuals.Three.ModelLayer = GeoGlobe.Class4OL(
    GeoGlobe.Visuals.Three.Base,
    {
        url: null,
        coordinate: null,
        scale: 1,
        ratation: null,
        initialize: function (a) {
            GeoGlobe.Visuals.Three.Base.prototype.initialize.apply(
                this,
                arguments
            );
            GeoGlobe.Util.extend(
                this,
                GeoGlobe.Util.pick(a, [
                    "url",
                    "coordinate",
                    "scale",
                    "ratation",
                ])
            );
        },
        render: function () {
            var a = this,
                b = this._three._threebox;
            this.url && this.coordinate
                ? new THREE.GLTFLoader().load(this.url, function (c) {
                      c = c.scene.clone();
                      console.log(c);
                      if (a.ratation)
                          for (var d in a.ratation) {
                              var e = a.ratation[d],
                                  e = (e / 360) * 2 * Math.PI;
                              c.rotation[d] = e;
                          }
                      a._meshes = [
                          b.addAtCoordinate(c, a.coordinate, {
                              scaleToLatitude: !0,
                              preScale: a.scale,
                          }),
                      ];
                      b.render();
                      d = {
                          exposure: 1,
                          bloomStrength: 1.5,
                          bloomThreshold: 0,
                          bloomRadius: 0,
                      };
                      c = new THREE.RenderPass(c, b.camera);
                      e = new THREE.UnrealBloomPass(
                          new THREE.Vector2(
                              window.innerWidth,
                              window.innerHeight
                          ),
                          1.5,
                          0.4,
                          0.85
                      );
                      e.threshold = d.bloomThreshold;
                      e.strength = d.bloomStrength;
                      e.radius = d.bloomRadius;
                      composer = new THREE.EffectComposer(b.renderer);
                      composer.addPass(c);
                      composer.addPass(e);
                      composer.render();
                  })
                : console.error(
                      "modelLayer: \u52a0\u8f7d\u6a21\u578b\u9519\u8bef\uff01"
                  );
        },
    }
);
GeoGlobe.Visuals.Three.PointLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    data: [],
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getTexture: function (a) {
        return a.properties.texture ? a.properties.texture : "";
    },
    getPoint: function (a) {
        return a.geometry.type === "Point" ? a.geometry.coordinates : null;
    },
    getSize: function (a) {
        return a.properties.size ? a.properties.size : 1;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.data = a.data ? a.data : this.data;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getPoint = a.getPoint ? a.getPoint : this.getPoint;
        this.getSize = a.getSize ? a.getSize : this.getSize;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        var a = this;
        a._three._removeInnerLayer(a);
        a._meshes = [];
        for (var b = 0; b < a.data.length; b++) {
            var c = a.data[b],
                d = null;
            if ((d = a.getTexture(c))) {
                var e = a._getTextureCacheByURL(d);
                e
                    ? ((e = e.clone()), (e.needsUpdate = !0))
                    : ((e = new THREE.TextureLoader().load(d, function () {
                          a._three._render();
                      })),
                      a._addTextureInToCache({ key: d, value: e }));
                d = new THREE.MeshPhongMaterial({
                    map: e,
                    transparent: !0,
                    opacity: a.opacity,
                });
            } else
                d = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(a.getColor(c)),
                    transparent: !0,
                    opacity: a.opacity,
                });
            e = a.getSize(c);
            e = new THREE.CircleBufferGeometry(
                (Threebox.ThreeboxConstants.PROJECTION_WORLD_SIZE * e) / 2,
                20
            );
            d = new THREE.Mesh(e, d);
            e = a._three._threebox.projectToWorld(
                a.data[b].geometry.coordinates
            );
            d.position.set(e.x, e.y, e.z);
            d.visible = a.visible;
            d.name = (a.id ? a.id : "threelayer") + "-" + b;
            d.userData.attributes = { OriginalData: c, Layer: a };
            a._three._threebox.addGeoreferencedMesh(d);
            a._meshes.push(d);
            a._three._render();
        }
    },
    _getTextureCacheByURL: function (a) {
        if (a)
            for (var b = 0; b < this._textureCache.length; b++)
                if (
                    this._textureCache[b].key === a &&
                    this._textureCache[b].value.image
                )
                    return this._textureCache[b].value;
        return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
    },
});
GeoGlobe.Visuals.Three.LineLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    data: [],
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getTexture: function (a) {
        return a.properties.texture ? a.properties.texture : "";
    },
    getLineString: function (a) {
        return a.geometry.type === "LineString" ? a.geometry.coordinates : null;
    },
    getWidth: function (a) {
        return a.properties.width ? a.properties.width : 1;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.data = a.data ? a.data : this.data;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getLineString = a.getLineString
            ? a.getLineString
            : this.getLineString;
        this.getWidth = a.getWidth ? a.getWidth : this.getWidth;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        this._three._removeInnerLayer(this);
        this._meshes = [];
        for (var a = 0; a < this.data.length; a++) {
            for (
                var b = this.data[a],
                    c = new THREE.LineMaterial({
                        color: new THREE.Color(this.getColor(b)),
                        linewidth: 5.0e-4 * this.getWidth(b),
                    }),
                    d = [],
                    e = this.data[a].geometry.coordinates,
                    f = 0;
                f < e.length;
                f++
            ) {
                var g = this._three._threebox.projectToWorld(e[f]);
                d.push(g.x, g.y, g.z);
            }
            e = new THREE.LineGeometry();
            e.setPositions(d);
            c = new THREE.Line2(e, c);
            c.computeLineDistances();
            c.visible = this.visible;
            c.name = (this.id ? this.id : "threelayer") + "-" + a;
            c.userData.attributes = { OriginalData: b, Layer: this };
            this._three._threebox.addGeoreferencedMesh(c);
            this._meshes.push(c);
            this._three._render();
        }
    },
});
GeoGlobe.Visuals.Three.PolygonLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    data: [],
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getTexture: function (a) {
        return a.properties.texture ? a.properties.texture : "";
    },
    getPolygon: function (a) {
        return a.geometry.type === "Polygon" ? a.geometry.coordinates : null;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.data = a.data ? a.data : this.data;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getPolygon = a.getPolygon ? a.getPolygon : this.getPolygon;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        var a = this;
        a._three._removeInnerLayer(a);
        a._meshes = [];
        for (var b = 0; b < a.data.length; b++) {
            var c = a.data[b],
                d = null;
            if ((d = a.getTexture(c))) {
                var e = a._getTextureCacheByURL(d);
                e
                    ? ((e = e.clone()), (e.needsUpdate = !0))
                    : ((e = new THREE.TextureLoader().load(d, function () {
                          a._three._render();
                      })),
                      a._addTextureInToCache({ key: d, value: e }));
                d = new THREE.MeshPhongMaterial({
                    map: e,
                    transparent: !0,
                    opacity: a.opacity,
                });
            } else
                d = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(a.getColor(c)),
                    transparent: !0,
                    opacity: a.opacity,
                });
            for (
                var e = new THREE.Shape(),
                    f = a.data[b].geometry.coordinates,
                    g = 0;
                g < f.length;
                g++
            ) {
                var h = a._three._threebox.projectToWorld(f[g][0]);
                e.moveTo(h.x, h.y);
                for (h = 1; h < f[g].length; h++) {
                    var j = a._three._threebox.projectToWorld(f[g][h]);
                    e.lineTo(j.x, j.y);
                }
            }
            e = new THREE.ShapeBufferGeometry(e);
            d = new THREE.Mesh(e, d);
            d.visible = a.visible;
            d.name = (a.id ? a.id : "threelayer") + "-" + b;
            d.userData.attributes = { OriginalData: c, Layer: a };
            a._three._threebox.addGeoreferencedMesh(d);
            a._meshes.push(d);
            a._three._render();
        }
    },
    _getTextureCacheByURL: function (a) {
        if (a)
            for (var b = 0; b < this._textureCache.length; b++)
                if (
                    this._textureCache[b].key === a &&
                    this._textureCache[b].value.image
                )
                    return this._textureCache[b].value;
        return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
    },
});
GeoGlobe.Visuals.Three.SymbolLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    data: [],
    scale: 1,
    modelURL: "",
    autoplay: !1,
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getPosition: function (a) {
        if (a.geometry.type === "Point") {
            var b = a.geometry.coordinates;
            a.properties.height ? b.push(a.properties.height) : b.push(0);
            return b;
        } else return null;
    },
    getGeometry: function (a) {
        return a;
    },
    getLoader: function () {
        return new THREE.JSONLoader();
    },
    _three: null,
    _meshes: [],
    _clock: null,
    _mixer: null,
    _modelCache: null,
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.data = a.data ? a.data : this.data;
        this.scale = a.scale ? a.scale : this.scale;
        this.modelURL = a.modelURL ? a.modelURL : this.modelURL;
        this.autoplay = a.autoplay ? a.autoplay : this.autoplay;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getPosition = a.getPosition ? a.getPosition : this.getPosition;
        this.getGeometry = a.getGeometry ? a.getGeometry : this.getGeometry;
        this.getLoader = a.getLoader ? a.getLoader : this.getLoader;
        this._clock = new THREE.Clock();
        this.timer = null;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        var a = this;
        a._modelCache = null;
        a.getLoader().load(
            a.modelURL,
            function (b) {
                a._modelCache = b;
                a._draw();
            },
            function (a) {
                console.log((a.loaded / a.total) * 100 + "% loaded");
            },
            function (a) {
                console.error(a);
            }
        );
    },
    redraw: function () {
        this._modelCache ? this._draw() : this.render();
    },
    _draw: function () {
        this._three._removeInnerLayer(this);
        this._meshes = [];
        if (this.timer) cancelAnimationFrame(this.timer), (this.timer = null);
        for (var a = this._modelCache, b = 0; b < this.data.length; b++) {
            if (a.scene)
                if (this.autoplay) {
                    symbol = a.scene;
                    symbol = this.getGeometry(symbol, this.data[b]);
                    var c = a.animations;
                    if (c && c.length) {
                        for (
                            var d = new THREE.AnimationMixer(symbol), e = 0;
                            e < c.length;
                            e++
                        )
                            d.clipAction(c[e]).play();
                        this._mixer = d;
                    }
                } else
                    (symbol = a.scene.clone()),
                        (symbol = this.getGeometry(symbol, this.data[b]));
            else
                a instanceof THREE.Group
                    ? ((symbol = a.clone()),
                      (symbol = this.getGeometry(symbol, this.data[b])))
                    : ((c = this.getGeometry(a.clone(), this.data[b])),
                      (d = new THREE.MeshLambertMaterial({
                          color: new THREE.Color(this.getColor(this.data[b])),
                          side: THREE.DoubleSide,
                          transparent: !0,
                          opacity: this.opacity,
                      })),
                      (symbol = new THREE.Mesh(c, d).clone()));
            symbol.visible = this.visible;
            symbol.name = (this.id ? this.id : "threelayer") + "-" + b;
            symbol.userData.attributes = {
                OriginalData: this.data[b],
                Layer: this,
            };
            c = this.scale ? this.scale : 1;
            d = this.getPosition(this.data[b]);
            Array.isArray(d) &&
                (d.length < 3 && d.push(0),
                this._three._threebox.addAtCoordinate(symbol, d, {
                    scaleToLatitude: !0,
                    preScale: c,
                }));
            this._meshes.push(symbol);
        }
        this._three._render();
        this._animate();
    },
    _animate: function () {
        var a = this;
        if (a.autoplay)
            a._mixer && a._mixer.update(a._clock.getDelta()),
                a._three._render(),
                (a.timer = requestAnimationFrame(function () {
                    a._animate();
                }));
    },
});
GeoGlobe.Visuals.Three.BuildingLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    drawMode: {
        high: { minZoom: 14, maxZoom: 15 },
        middle: { minZoom: 16, maxZoom: 17 },
        low: { minZoom: 18, maxZoom: 20 },
    },
    data: [],
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getFaceTexture: function (a) {
        return a.properties.face_texture ? a.properties.face_texture : "";
    },
    getFaceTextureRepeat: function (a) {
        return a.properties.face_texture_repeat
            ? a.properties.face_texture_repeat
            : "10,10";
    },
    getSideTexture: function (a) {
        return a.properties.side_texture ? a.properties.side_texture : "";
    },
    getSideTextureRepeat: function (a) {
        return a.properties.side_texture_repeat
            ? a.properties.side_texture_repeat
            : "30,30";
    },
    getPolygon: function (a) {
        return a.geometry.type === "Polygon" ? a.geometry.coordinates : null;
    },
    getElevation: function (a) {
        return a.properties.height ? a.properties.height : 0;
    },
    getBaseElevation: function (a) {
        return a.properties.base_height ? a.properties.base_height : 0;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.drawMode = a.drawMode ? a.drawMode : this.drawMode;
        this.data = a.data ? a.data : this.data;
        this.scale = a.scale ? a.scale : this.scale;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getFaceTexture = a.getFaceTexture
            ? a.getFaceTexture
            : this.getFaceTexture;
        this.getFaceTextureRepeat = a.getFaceTextureRepeat
            ? a.getFaceTextureRepeat
            : this.getFaceTextureRepeat;
        this.getSideTexture = a.getSideTexture
            ? a.getSideTexture
            : this.getSideTexture;
        this.getSideTextureRepeat = a.getSideTextureRepeat
            ? a.getSideTextureRepeat
            : this.getSideTextureRepeat;
        this.getPolygon = a.getPolygon ? a.getPolygon : this.getPolygon;
        this.getElevation = a.getElevation ? a.getElevation : this.getElevation;
        this.getBaseElevation = a.getBaseElevation
            ? a.getBaseElevation
            : this.getBaseElevation;
        this.wrapmode = a.wrapmode || "repeat";
        (!this.drawMode ||
            !this.drawMode.high ||
            !this.drawMode.middle ||
            !this.drawMode.low ||
            this.drawMode.high.maxZoom == void 0 ||
            this.drawMode.high.minZoom == void 0 ||
            this.drawMode.high.maxZoom < this.drawMode.high.minZoom) &&
            console.error(
                "option\u4e2d\u7684drawMode\u683c\u5f0f\u4e0d\u6b63\u786e\uff01"
            );
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        this._three._removeInnerLayer(this);
        this._meshes = [];
        switch (this._getDrawMode()) {
            case "high":
                this._highDraw();
                break;
            case "middle":
                this._middleDraw();
                break;
            case "low":
                this._lowDraw();
                break;
            default:
                this._highDraw();
        }
        this._three._render();
    },
    _getDrawMode: function () {
        var a = this._three.map.getZoom();
        if (this.drawMode.high.minZoom < a && this.drawMode.high.maxZoom >= a)
            return "high";
        if (
            this.drawMode.middle.minZoom < a &&
            this.drawMode.middle.maxZoom >= a
        )
            return "middle";
        if (this.drawMode.low.minZoom < a && this.drawMode.low.maxZoom >= a)
            return "low";
        return null;
    },
    _highDraw: function () {
        for (
            var a = new THREE.Geometry(),
                b =
                    this.data.length > 0
                        ? this.getColor(this.data[0])
                        : "rgb(255, 0, 0)",
                b = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(b),
                    opacity: this.opacity,
                    transparent: !0,
                }),
                c = 0;
            c < this.data.length;
            c++
        ) {
            var d = this._createGeometry(this.data[c]);
            a.merge(d);
        }
        a = new THREE.Mesh(a, b);
        a.visible = this.visible;
        a.name = (this.id ? this.id : "threelayer") + "-merge";
        a.userData.attributes = { OriginalData: this.data, Layer: this };
        this._three._threebox.addGeoreferencedMesh(a);
        this._meshes.push(a);
    },
    _middleDraw: function () {
        for (var a = 0; a < this.data.length; a++) {
            var b = this.data[a],
                c = this.getFaceTexture(b),
                d = this.getSideTexture(b),
                e = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(this.getColor(b)),
                    opacity: this.opacity,
                    transparent: !0,
                });
            if (c) {
                c = this._createTexture(c);
                if (this.wrapmode === "repeat") {
                    c.wrapS = c.wrapT = THREE.RepeatWrapping;
                    var f = this.getFaceTextureRepeat(b).split(",");
                    c.repeat.set(f[0], f[1]);
                } else c.wrapS = c.wrapT = THREE.ClampToEdgeWrapping;
                c = new THREE.MeshPhongMaterial({
                    map: c,
                    opacity: this.opacity,
                    transparent: !0,
                });
            } else c = e.clone();
            d
                ? ((d = this._createTexture(d)),
                  this.wrapmode === "repeat"
                      ? ((d.wrapS = d.wrapT = THREE.RepeatWrapping),
                        (f = this.getFaceTextureRepeat(b).split(",")),
                        d.repeat.set(f[0], f[1]))
                      : (d.wrapS = d.wrapT = THREE.ClampToEdgeWrapping),
                  (d = new THREE.MeshPhongMaterial({
                      map: d,
                      opacity: this.opacity,
                      transparent: !0,
                  })))
                : (d = e.clone());
            e = this._createGeometry(b);
            e = this._createUvs(e);
            c = new THREE.Mesh(e, [c, d]);
            c.visible = this.visible;
            c.name = (this.id ? this.id : "threelayer") + "-" + a;
            c.userData.attributes = { OriginalData: b, Layer: this };
            this._three._threebox.addGeoreferencedMesh(c);
            this._meshes.push(c);
        }
    },
    _lowDraw: function () {
        for (var a = 0; a < this.data.length; a++) {
            var b = this.data[a],
                c = this.getFaceTexture(b),
                d = this.getSideTexture(b),
                e = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(this.getColor(b)),
                    opacity: this.opacity,
                    transparent: !0,
                });
            if (c) {
                c = this._createTexture(c);
                if (this.wrapmode === "repeat") {
                    c.wrapS = c.wrapT = THREE.RepeatWrapping;
                    var f = this.getFaceTextureRepeat(b).split(",");
                    c.repeat.set(f[0], f[1]);
                } else c.wrapS = c.wrapT = THREE.ClampToEdgeWrapping;
                c = new THREE.MeshPhongMaterial({
                    map: c,
                    opacity: this.opacity,
                    transparent: !0,
                });
            } else c = e.clone();
            d
                ? ((d = this._createTexture(d)),
                  this.wrapmode === "repeat"
                      ? ((d.wrapS = d.wrapT = THREE.RepeatWrapping),
                        (f = this.getFaceTextureRepeat(b).split(",")),
                        d.repeat.set(f[0], f[1]))
                      : (d.wrapS = d.wrapT = THREE.ClampToEdgeWrapping),
                  (d = new THREE.MeshPhongMaterial({
                      map: d,
                      opacity: this.opacity,
                      transparent: !0,
                  })))
                : (d = e.clone());
            e = this._createGeometry(b);
            e = this._createUvs(e);
            c = new THREE.Mesh(e, [c, d]);
            c.visible = this.visible;
            c.name = (this.id ? this.id : "threelayer") + "-" + a;
            c.userData.attributes = { OriginalData: b, Layer: this };
            this._three._threebox.addGeoreferencedMeshToWorld2(c);
            this._meshes.push(c);
        }
    },
    _createGeometry: function (a) {
        var b = a.geometry.coordinates[0],
            c = new THREE.Shape(),
            d = this._three._threebox.projectToWorld(b[0]);
        c.moveTo(d.x, d.y);
        for (d = 1; d < b.length; d++) {
            var e = this._three._threebox.projectToWorld(b[d]);
            c.lineTo(e.x, e.y);
        }
        b = {
            depth: this._three._threebox.distaneToWorld(this.getElevation(a)),
            bevelEnabled: !1,
            material: 0,
            extrudeMaterial: 1,
        };
        c = new THREE.ExtrudeGeometry(c, b);
        if ((a = this.getBaseElevation(a)) && a > 0)
            (a = this._three._threebox.distaneToWorld(a)), c.translate(0, 0, a);
        return c;
    },
    _createUvs: function (a) {
        a.faceVertexUvs = [[]];
        for (
            var b = [
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(0, 1),
                    new THREE.Vector2(1, 1),
                ],
                c = a.faces.length,
                d = 0;
            d < c;
            d += 2
        )
            if (a.faces[d].normal.z == 0)
                (a.faceVertexUvs[0][d] = [b[1], b[0], b[2]]),
                    (a.faceVertexUvs[0][d + 1] = [b[0], b[3], b[2]]);
            else {
                var e = a.vertices[a.faces[d].a],
                    f = a.vertices[a.faces[d].b],
                    g = a.vertices[a.faces[d].c];
                a.faceVertexUvs[0][d] = [
                    new THREE.Vector2(e.x, e.y),
                    new THREE.Vector2(f.x, f.y),
                    new THREE.Vector2(g.x, g.y),
                ];
                e = a.vertices[a.faces[d + 1].a];
                f = a.vertices[a.faces[d + 1].b];
                g = a.vertices[a.faces[d + 1].c];
                a.faceVertexUvs[0][d + 1] = [
                    new THREE.Vector2(e.x, e.y),
                    new THREE.Vector2(f.x, f.y),
                    new THREE.Vector2(g.x, g.y),
                ];
            }
        return a;
    },
    _createTexture: function (a) {
        var b = this,
            c = b._getTextureCacheByURL(a);
        c
            ? ((c = c.clone()), (c.needsUpdate = !0))
            : ((c = new THREE.TextureLoader().load(a, function () {
                  b._three._render();
              })),
              b._addTextureInToCache({ key: a, value: c }));
        return c;
    },
    _getTextureCacheByURL: function (a) {
        if (a)
            for (; 0 < this._textureCache.length; )
                return this._textureCache[0].key === a &&
                    this._textureCache[0].value.image
                    ? this._textureCache[0].value
                    : null;
        else return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
    },
});
GeoGlobe.Visuals.Three.VideoLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    autoplay: !0,
    data: [],
    getVideoTexture: function (a) {
        return a.properties.video_texture ? a.properties.video_texture : "";
    },
    getLine: function (a) {
        return a.geometry.type === "LineString" ? a.geometry.coordinates : null;
    },
    getElevation: function (a) {
        return a.properties.height ? a.properties.height : 0;
    },
    getBaseElevation: function (a) {
        return a.properties.base_height ? a.properties.base_height : 0;
    },
    _three: null,
    _meshes: [],
    _frameId: null,
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.autoplay = a.autoplay ? a.autoplay : this.autoplay;
        this.data = a.data ? a.data : this.data;
        this.getVideoTexture = a.getVideoTexture
            ? a.getVideoTexture
            : this.getVideoTexture;
        this.getLine = a.getLine ? a.getLine : this.getLine;
        this.getElevation = a.getElevation ? a.getElevation : this.getElevation;
        this.getBaseElevation = a.getBaseElevation
            ? a.getBaseElevation
            : this.getBaseElevation;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        this._three._removeInnerLayer(this);
        this._meshes = [];
        if (this._frameId)
            cancelAnimationFrame(this._frameId), (this._frameId = null);
        for (
            var a = [
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(0, 1),
                    new THREE.Vector2(1, 1),
                ],
                b = 0;
            b < this.data.length;
            b++
        ) {
            var c = this.data[b],
                d = this.getVideoTexture(c);
            if (d) {
                var e = document.createElement("video");
                e.setAttribute("class", "geoglobe-three-video");
                e.setAttribute("src", d);
                e.setAttribute("autoplay", "autoplay");
                e.setAttribute("loop", "loop");
                e.style.display = "none";
                document.body.appendChild(e);
                d = new THREE.VideoTexture(e);
                d.minFilter = THREE.LinearFilter;
                d.magFilter = THREE.LinearFilter;
                d.format = THREE.RGBFormat;
                var d = new THREE.MeshPhongMaterial({
                        map: d,
                        side: THREE.DoubleSide,
                        transparent: !0,
                        opacity: this.opacity,
                    }),
                    f = this.getBaseElevation(c),
                    e = this._three._threebox.distaneToWorld(f),
                    g = this.getElevation(c),
                    f = this._three._threebox.distaneToWorld(f + g),
                    h = this.getLine(c),
                    g = this._three._threebox.projectToWorld(h[0]),
                    h = this._three._threebox.projectToWorld(h[1]),
                    j = h.clone(),
                    l = g.clone();
                g.z = e;
                h.z = e;
                j.z = f;
                l.z = f;
                e = [g, h, j, l];
                f = [new THREE.Face3(0, 1, 2), new THREE.Face3(0, 2, 3)];
                g = new THREE.Geometry();
                g.vertices = e;
                g.faces = f;
                g.computeFaceNormals();
                g.faceVertexUvs = [[]];
                g.faceVertexUvs[0][0] = [a[0], a[1], a[2]];
                g.faceVertexUvs[0][1] = [a[0], a[2], a[3]];
                g.translate(
                    g.faces[0].normal.x * 1.0e-5,
                    g.faces[0].normal.y * 1.0e-5,
                    g.faces[0].normal.z * 1.0e-5
                );
                d = new THREE.Mesh(g, d);
                d.visible = this.visible;
                d.name = (this.id ? this.id : "threelayer") + "-" + b;
                d.userData.attributes = { OriginalData: c, Layer: this };
                this._three._threebox.addGeoreferencedMeshToWorld2(d);
                this._meshes.push(d);
            } else
                console.warn(
                    "\u89c6\u9891\u7eb9\u7406\u4e3a\u5fc5\u8981\u5c5e\u6027\uff01"
                );
        }
        this._three._render();
        this._animate();
    },
    play: function () {
        this.autoplay = !0;
        if (this._frameId)
            cancelAnimationFrame(this._frameId), (this._frameId = null);
        this._animate();
    },
    stop: function () {
        this.autoplay = !1;
        window.cancelAnimationFrame(this._frameId);
    },
    _animate: function () {
        var a = this;
        if (a.autoplay)
            a._three._render(),
                (a._frameId = window.requestAnimationFrame(function () {
                    a._animate();
                }));
    },
});
GeoGlobe.Visuals.Three.TextLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    scale: 1,
    data: [],
    fontURL: "",
    size: 100,
    thickness: 50,
    curveSegments: 12,
    getPosition: function (a) {
        if (a.geometry.type === "Point") {
            var b = a.geometry.coordinates;
            a.properties.height ? b.push(a.properties.height) : b.push(0);
            return b;
        } else return null;
    },
    getText: function (a) {
        return a.properties.text
            ? a.properties.text
            : "\u672a\u77e5\u6587\u672c";
    },
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getGeometry: function (a) {
        return a;
    },
    _three: null,
    _meshes: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.scale = a.scale ? a.scale : this.scale;
        this.size = a.size ? a.size : this.size;
        this.thickness = a.thickness ? a.thickness : this.thickness;
        this.curveSegments = a.curveSegments
            ? a.curveSegments
            : this.curveSegments;
        this.data = a.data ? a.data : this.data;
        this.fontURL = a.fontURL ? a.fontURL : this.fontURL;
        this.getPosition = a.getPosition ? a.getPosition : this.getPosition;
        this.getText = a.getText ? a.getText : this.getText;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getGeometry = a.getGeometry ? a.getGeometry : this.getGeometry;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        var a = this;
        a.fontURL
            ? (this._three._removeInnerLayer(this),
              (this._meshes = []),
              new THREE.FontLoader().load(a.fontURL, function (b) {
                  for (var c = 0; c < a.data.length; c++) {
                      var d = a.data[c],
                          e = a.getText(d),
                          e = new THREE.TextGeometry(e, {
                              font: b,
                              size: a.size,
                              height: a.thickness,
                              curveSegments: a.curveSegments,
                          });
                      e.computeBoundingBox();
                      e.computeVertexNormals();
                      e = a.getGeometry(e, d);
                      materials = [
                          new THREE.MeshPhongMaterial({
                              color: new THREE.Color(a.getColor(d)),
                              flatShading: !0,
                              transparent: !0,
                              opacity: a.opacity,
                          }),
                          new THREE.MeshPhongMaterial({
                              color: new THREE.Color(a.getColor(d)),
                              transparent: !0,
                              opacity: a.opacity,
                          }),
                      ];
                      textMesh = new THREE.Mesh(e, materials);
                      var e = a.getPosition(d),
                          f = a.scale ? a.scale : 1;
                      textMesh.visible = a.visible;
                      textMesh.name = (a.id ? a.id : "threelayer") + "-" + c;
                      textMesh.userData.attributes = {
                          OriginalData: d,
                          Layer: a,
                      };
                      a._three._threebox.addAtCoordinate(textMesh, e, {
                          scaleToLatitude: !0,
                          preScale: f,
                      });
                      a._meshes.push(textMesh);
                  }
                  a._three._render();
              }))
            : console.error(
                  "\u5b57\u4f53\u8d44\u6e90\u662f\u5fc5\u987b\u7684\u5c5e\u6027\uff01"
              );
    },
});
GeoGlobe.Visuals.Three.CurveLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    data: [],
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getTexture: function (a) {
        return a.properties.texture ? a.properties.texture : "";
    },
    getLineString: function (a) {
        return a.geometry.type === "LineString" ? a.geometry.coordinates : null;
    },
    getWidth: function (a) {
        return a.properties.width ? a.properties.width : 1;
    },
    getCurveness: function (a) {
        return a.properties.curveness ? a.properties.curveness : 0.2;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.texture = a.texture ? a.texture : this.texture;
        this.data = a.data ? a.data : this.data;
        this.getColor = a.getColor ? a.getColor : this.getColor;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getLineString = a.getLineString
            ? a.getLineString
            : this.getLineString;
        this.getWidth = a.getWidth ? a.getWidth : this.getWidth;
        this.getCurveness = a.getCurveness ? a.getCurveness : this.getCurveness;
        this.timer = null;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    render: function () {
        var a = this;
        this._three._removeInnerLayer(this);
        this._meshes = [];
        if (a.timer) cancelAnimationFrame(a.timer), (a.timer = null);
        for (
            var b = [], c = [], d = [], e = [], f = 0;
            f < this.data.length;
            f++
        ) {
            var g = this.data[f],
                h = this.getWidth(g),
                j = new THREE.Color(this.getColor(g)),
                l = new THREE.LineMaterial({
                    linewidth: 5.0e-4 * h,
                    color: j,
                    opacity: 1,
                    transparent: !0,
                }),
                m = [],
                n = [],
                o = [],
                v = this.data[f].geometry.coordinates;
            if (v.length > 1)
                var k = this._three._threebox.projectToWorld(v[0]),
                    p = this._three._threebox.projectToWorld(v[v.length - 1]),
                    p = Math.sqrt(
                        Math.pow(p.x - k.x, 2) +
                            Math.pow(p.y - k.y, 2) +
                            Math.pow(p.z - k.z, 2)
                    );
            for (var u = 0; u < v.length - 1; u++) {
                var m = this._three._threebox.projectToWorld(v[u]),
                    s = this._three._threebox.projectToWorld(v[u + 1]),
                    q = {
                        x: (m.x + s.x) / 2,
                        y: (m.y + s.y) / 2,
                        z:
                            (Math.sqrt(
                                Math.pow(s.x - m.x, 2) + Math.pow(s.y - m.y, 2)
                            ) /
                                2) *
                            Math.tan((Math.PI / 2) * this.getCurveness(g)),
                    },
                    q = new THREE.QuadraticBezierCurve3(
                        new THREE.Vector3(m.x, m.y, m.z),
                        new THREE.Vector3(q.x, q.y, q.z),
                        new THREE.Vector3(s.x, s.y, s.z)
                    );
                if (v.length > 1)
                    (q.rate1 =
                        Math.sqrt(
                            Math.pow(m.x - k.x, 2) +
                                Math.pow(m.y - k.y, 2) +
                                Math.pow(m.z - k.z, 2)
                        ) / p),
                        (q.rate2 =
                            Math.sqrt(
                                Math.pow(s.x - m.x, 2) +
                                    Math.pow(s.y - m.y, 2) +
                                    Math.pow(s.z - m.z, 2)
                            ) / p);
                o.push(q);
                m = q.getPoints(50);
                for (s = 0; s < m.length; s++) n.push(m[s].x, m[s].y, m[s].z);
            }
            v = new THREE.LineGeometry();
            v.setPositions(n);
            l = new THREE.Line2(v, l);
            l.computeLineDistances();
            l.visible = this.visible;
            l.name = (this.id ? this.id : "threelayer") + "-" + f;
            l.userData.attributes = { OriginalData: g, Layer: this };
            this._three._threebox.addGeoreferencedMesh(l);
            this._meshes.push(l);
            b.push(n[0]);
            b.push(n[1]);
            b.push(n[2]);
            c.push(j.r, j.g, j.b);
            d.push(10 + h * h);
            e.push(o);
        }
        var r = new THREE.BufferGeometry(),
            f = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {
                        value: new THREE.TextureLoader().load(this.texture),
                    },
                },
                vertexShader:
                    "attribute float size;varying vec3 vColor;void main() {vColor = color;vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );gl_PointSize = size;gl_Position = projectionMatrix * mvPosition;}",
                fragmentShader:
                    "varying vec3 vColor;uniform sampler2D texture;void main() {gl_FragColor = vec4( vColor, 1.0 );gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );}",
                blending: THREE.AdditiveBlending,
                depthTest: !1,
                transparent: !0,
                vertexColors: !0,
            });
        r.addAttribute(
            "position",
            new THREE.Float32BufferAttribute(b, 3).setDynamic(!0)
        );
        r.addAttribute("color", new THREE.Float32BufferAttribute(c, 3));
        r.addAttribute("size", new THREE.Float32BufferAttribute(d, 1));
        b = new THREE.Points(r, f);
        b.visible = this.visible;
        b.name = "particles";
        b.userData.attributes = { OriginalData: g, Layer: this };
        this._three._threebox.addGeoreferencedMesh(b);
        this._meshes.push(b);
        this._three._render();
        var t = 0,
            w;
        (function B() {
            a.timer = requestAnimationFrame(B);
            t += 0.005;
            t > 1 && (t = 0);
            for (
                var b = r.attributes.position.array, c = 0;
                c < e.length;
                c++
            ) {
                if (e[c].length === 1) w = e[c][0].getPoint(t);
                else
                    for (var d = 0; d < e[c].length; d++)
                        if (
                            t >= e[c][d].rate1 &&
                            t <= e[c][d].rate1 + e[c][d].rate2
                        ) {
                            w = e[c][d].getPoint(
                                (t - e[c][d].rate1) / e[c][d].rate2
                            );
                            break;
                        }
                b[c * 3] = w.x;
                b[c * 3 + 1] = w.y;
                b[c * 3 + 2] = w.z;
            }
            r.attributes.position.needsUpdate = !0;
            a._three._render();
        })();
    },
});
GeoGlobe.Visuals.Three.SingleBuildingLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    isCirclesVisible: !0,
    lightShown: !0,
    lightColor: "rgb(255, 255, 0)",
    floorColor: "white",
    wallColor: "yellow",
    movingFloorColor: "rgb(135, 135, 135)",
    specificFloorColor: "#00FFFF",
    specificWallColor: "rgb(32, 178, 170)",
    floorColorOpacity: 0.6,
    wallColorOpacity: 0.3,
    movingFloorColorOpacity: 0.2,
    specificFloorColorOpacity: 0.6,
    specificWallColorOpacity: 0.3,
    isFloorLinesVisible: !0,
    floorLinesColor: "#627BC1",
    floorLinesOpacity: 0.5,
    topLineColor: "#ffffff",
    topLineOpacity: 1,
    isPillarVisible: !0,
    pillarColor: "#ffffff",
    pillarOpacity: 0.5,
    originalFloorColor: "#627BC1",
    originalFloorOpacity: 0.1,
    originalWallColor: "#627BC1",
    originalWallOpacity: 0.05,
    isRoofVisible: !0,
    roofColor: "#627BC1",
    roofOpacity: 0.8,
    data: {},
    getColor: function (a) {
        return a.properties.color ? a.properties.color : "rgb(255, 0, 0)";
    },
    getPolygon: function (a) {
        return a.geometry.type === "Polygon" ? a.geometry.coordinates : null;
    },
    getElevation: function (a) {
        if (a.properties.levels) {
            var b = 0;
            (typeof a.properties.levels === "string"
                ? JSON.parse(a.properties.levels)
                : a.properties.levels
            ).forEach(function (a) {
                b += a;
            });
            return b;
        } else return 0;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    _HOVER_FLOOR: null,
    _CLICK_ITEM: null,
    _SELECT_ITEMS: null,
    initialize: function (a) {
        if (window.turf) {
            this.id = a.id ? a.id : this.id;
            if (a.visible !== void 0) this.visible = a.visible;
            if (a.isCirclesVisible !== void 0)
                this.isCirclesVisible = a.isCirclesVisible;
            if (a.isFloorLinesVisible !== void 0)
                this.isFloorLinesVisible = a.isFloorLinesVisible;
            if (a.isPillarVisible !== void 0)
                this.isPillarVisible = a.isPillarVisible;
            if (a.lightShown !== void 0) this.lightShown = a.lightShown;
            if (a.isRoofVisible !== void 0)
                this.isRoofVisible = a.isRoofVisible;
            this.lightColor = a.lightColor ? a.lightColor : this.lightColor;
            this.floorColor = a.floorColor ? a.floorColor : this.floorColor;
            this.wallColor = a.wallColor ? a.wallColor : this.wallColor;
            this.movingFloorColor = a.movingFloorColor
                ? a.movingFloorColor
                : this.movingFloorColor;
            this.floorColorOpacity = a.floorColorOpacity
                ? a.floorColorOpacity
                : this.floorColorOpacity;
            this.wallColorOpacity = a.wallColorOpacity
                ? a.wallColorOpacity
                : this.wallColorOpacity;
            this.movingFloorColorOpacity = a.movingFloorColorOpacity
                ? a.movingFloorColorOpacity
                : this.movingFloorColorOpacity;
            this.specificFloorColor = a.specificFloorColor
                ? a.specificFloorColor
                : this.specificFloorColor;
            this.specificWallColor = a.specificWallColor
                ? a.specificWallColor
                : this.specificWallColor;
            this.specificFloorColorOpacity = a.specificFloorColorOpacity
                ? a.specificFloorColorOpacity
                : this.specificFloorColorOpacity;
            this.specificWallColorOpacity = a.specificWallColorOpacity
                ? a.specificWallColorOpacity
                : this.specificWallColorOpacity;
            this.floorLinesColor = a.floorLinesColor
                ? a.floorLinesColor
                : this.floorLinesColor;
            this.floorLinesOpacity = a.floorLinesOpacity
                ? a.floorLinesOpacity
                : this.floorLinesOpacity;
            this.topLineColor = a.topLineColor
                ? a.topLineColor
                : this.topLineColor;
            this.topLineOpacity = a.topLineOpacity
                ? a.topLineOpacity
                : this.topLineOpacity;
            this.pillarColor = a.pillarColor ? a.pillarColor : this.pillarColor;
            this.pillarOpacity = a.pillarOpacity
                ? a.pillarOpacity
                : this.pillarOpacity;
            this.originalFloorColor = a.originalFloorColor
                ? a.originalFloorColor
                : this.originalFloorColor;
            this.originalFloorOpacity = a.originalFloorOpacity
                ? a.originalFloorOpacity
                : this.originalFloorOpacity;
            this.originalWallColor = a.originalWallColor
                ? a.originalWallColor
                : this.originalWallColor;
            this.originalWallOpacity = a.originalWallOpacity
                ? a.originalWallOpacity
                : this.originalWallOpacity;
            this.roofColor = a.roofColor ? a.roofColor : this.roofColor;
            this.roofOpacity = a.roofOpacity ? a.roofOpacity : this.roofOpacity;
            this.data = a.data ? a.data : this.data;
            this.isClicked = !0;
            this.getColor = a.getColor ? a.getColor : this.getColor;
            this.getPolygon = a.getPolygon ? a.getPolygon : this.getPolygon;
            this.getElevation = a.getElevation
                ? a.getElevation
                : this.getElevation;
            this.getBaseElevation = a.getBaseElevation
                ? a.getBaseElevation
                : this.getBaseElevation;
            this.timer = null;
        } else console.error("\u672a\u5f15\u5165turf.js\u5e93\uff01");
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    _createLineGeometry: function (a) {
        var b = new THREE.Geometry();
        a.forEach(function (a) {
            b.vertices.push(a);
        });
        return b;
    },
    _createGeoExtrudeGeometry: function (a, b) {
        var c = new THREE.Shape(a),
            c = new THREE.GeoExtrudeGeometry(c, b),
            d = new THREE.Geometry();
        d.faceVertexUvs = c.faceVertexUvs.concat();
        d.faces = c.faces.concat();
        d.vertices = c.vertices.concat();
        return d;
    },
    _createSideGeometry: function (a, b) {
        var c = new THREE.Shape(a),
            c = new THREE.GeoExtrudeGeometry(c, b),
            d = 0;
        c.faces.forEach(function (a) {
            a.normal.z != 0 && d++;
        });
        c.faces.splice(0, d);
        var e = new THREE.Geometry();
        e.faceVertexUvs = c.faceVertexUvs.concat();
        e.faces = c.faces.concat();
        e.vertices = c.vertices.concat();
        return e;
    },
    _createPillarMesh: function (a, b, c) {
        var d = this,
            e = new THREE.Geometry();
        a.forEach(function (a) {
            var g = [];
            a.geometry.coordinates[0].forEach(function (a) {
                g.push(d._three._threebox.projectToWorld(a));
            });
            var a = new THREE.Shape(g),
                a = new THREE.GeoExtrudeGeometry(a, b),
                h = new THREE.Geometry();
            h.faceVertexUvs = a.faceVertexUvs.concat();
            h.faces = a.faces.concat();
            h.vertices = a.vertices.concat();
            a = new THREE.Mesh(h, c);
            e.merge(a.geometry, a.matrix);
        });
        return new THREE.Mesh(e, c);
    },
    _changeColor: function (a, b) {
        a &&
            b &&
            (a instanceof Array || (a = [a]),
            b instanceof Array || (b = [b]),
            a.length &&
                b.length &&
                a.forEach(function (a, d) {
                    var e = b[d] || b[0];
                    Object.keys(e).forEach(function (b) {
                        var d = e[b];
                        switch (b) {
                            case "color":
                                d instanceof THREE.Color ||
                                    (d = new THREE.Color(d));
                        }
                        a.material[b] = d;
                    });
                }));
    },
    _reRender: function () {
        var a = this;
        this._SELECT_ITEMS &&
            this._SELECT_ITEMS.forEach(function (b) {
                a._changeColor(b, [
                    {
                        color: a.specificFloorColor,
                        opacity: a.specificFloorColorOpacity,
                    },
                    {
                        color: a.specificWallColor,
                        opacity: a.specificWallColorOpacity,
                    },
                ]);
            });
        this._changeColor(this._CLICK_ITEM, [
            { color: this.floorColor, opacity: this.floorColorOpacity },
            { color: this.wallColor, opacity: this.wallColorOpacity },
        ]);
        this._changeColor(this._HOVER_FLOOR, {
            color: this.movingFloorColor,
            opacity: this.movingFloorColorOpacity,
        });
        this._three._render();
    },
    clear: function () {
        this._changeColor(this._HOVER_FLOOR, {
            color: this.originalFloorColor,
            opacity: this.originalFloorOpacity,
        });
        this._HOVER_FLOOR = null;
        this._changeColor(this._CLICK_ITEM, [
            {
                color: this.originalFloorColor,
                opacity: this.originalFloorOpacity,
            },
            {
                color: this.originalWallColor,
                opacity: this.originalWallOpacity,
            },
        ]);
        this._CLICK_ITEM = null;
        var a = this;
        this._SELECT_ITEMS &&
            this._SELECT_ITEMS.forEach(function (b) {
                a._changeColor(b, [
                    {
                        color: a.originalFloorColor,
                        opacity: a.originalFloorOpacity,
                    },
                    {
                        color: a.originalWallColor,
                        opacity: a.originalWallOpacity,
                    },
                ]);
            });
        this._SELECT_ITEMS = null;
        this._reRender();
    },
    highlightFloor: function (a) {
        this._changeColor(this._HOVER_FLOOR, {
            color: this.originalFloorColor,
            opacity: this.originalFloorOpacity,
        });
        var b = (this._HOVER_FLOOR = null);
        if (a.length > 0) {
            for (var c = 0; c < a.length; c++)
                if (a[c].object.userData.tag == "__floor__") {
                    b = a[c].object;
                    break;
                }
            if (b) this._HOVER_FLOOR = b;
        }
        this._reRender();
        return b;
    },
    highlightFloor_Wall: function (a) {
        this._changeColor(this._CLICK_ITEM, [
            {
                color: this.originalFloorColor,
                opacity: this.originalFloorOpacity,
            },
            {
                color: this.originalWallColor,
                opacity: this.originalWallOpacity,
            },
        ]);
        var b = (this._CLICK_ITEM = null),
            c = null;
        if (a.length > 0) {
            for (var d = 0; d < a.length; d++) {
                if (a[d].object.userData.tag == "__wall__") c = a[d].object;
                if (a[d].object.userData.tag == "__floor__") {
                    b = a[d].object;
                    break;
                }
            }
            if (b && c) this._CLICK_ITEM = [b, c];
        }
        this._reRender();
        return b;
    },
    locateToSpecificFloor: function (a) {
        var b = this;
        this._SELECT_ITEMS &&
            this._SELECT_ITEMS.forEach(function (a) {
                b._changeColor(a, [
                    {
                        color: b.originalFloorColor,
                        opacity: b.originalFloorOpacity,
                    },
                    {
                        color: b.originalWallColor,
                        opacity: b.originalWallOpacity,
                    },
                ]);
            });
        var c = (this._SELECT_ITEMS = null);
        if (a instanceof Array)
            (this._SELECT_ITEMS = a = a
                .map(function (a) {
                    var c = b._three._threebox.world2.getObjectByName(
                            "this is " + a + " floor"
                        ),
                        a = b._three._threebox.world2.getObjectByName(
                            "this is " + a + " wall"
                        );
                    if (c) return [c, a];
                    return null;
                })
                .filter(function (a) {
                    return !!a;
                })),
                (c = a.map(function (a) {
                    return a[0];
                }));
        else if (
            ((c = this._three._threebox.world2.getObjectByName(
                "this is " + a + " floor"
            )),
            (a = this._three._threebox.world2.getObjectByName(
                "this is " + a + " wall"
            )),
            c && a)
        )
            this._SELECT_ITEMS = [[c, a]];
        this._reRender();
        return c;
    },
    getSelectedFloor: function (a) {
        var b = null;
        if (a.length > 0)
            for (var c = 0; c < a.length; c++)
                if (a[c].object.userData.tag == "__floor__") {
                    b = a[c].object;
                    break;
                }
        return b;
    },
    render: function () {
        function a(c, d) {
            d > 1e3 / 60 &&
                (z < 1
                    ? (A.position.copy(B.getPointAt(z)), (z += 0.01))
                    : (z = 0),
                b._three._render(),
                (d = 0));
            b.timer = window.requestAnimationFrame(function (b) {
                return a(b, d + b - c);
            });
        }
        this.clear();
        var b = this;
        b._three._removeInnerLayer(b);
        b._meshes = [];
        if (b.timer) cancelAnimationFrame(b.timer), (b.timer = null);
        var c = new THREE.Group();
        c.visible = this.visible;
        c.name = "main part";
        c.userData.attributes = { OriginalData: b.data, Layer: b };
        var d = new THREE.Group();
        d.visible = this.visible;
        d.name = "extra part";
        d.userData.attributes = { OriginalData: b.data, Layer: b };
        if (b.data.geometry) {
            var e = turf.centroid(b.data).geometry.coordinates;
            if (b.isCirclesVisible) {
                var f = new THREE.MeshBasicMaterial({
                    color: 7372944,
                    transparent: !0,
                    opacity: 0.3,
                });
                [
                    0.01,
                    0.015,
                    0.02,
                    0.025,
                    0.03,
                    0.035,
                    0.04,
                    0.045,
                    0.05,
                    0.055,
                ].forEach(function (a) {
                    var a = turf.circle(e, a, {
                            steps: 50,
                            units: "kilometers",
                            properties: {},
                        }),
                        d = new THREE.Geometry();
                    a.geometry.coordinates[0].forEach(function (a) {
                        d.vertices.push(
                            b._three._threebox.projectToWorld([a[0], a[1], -1])
                        );
                    });
                    a = new THREE.Line(d, f);
                    c.add(a);
                });
            }
            for (
                var g = b.data.geometry.coordinates[0],
                    h =
                        typeof b.data.properties.levels === "string"
                            ? JSON.parse(b.data.properties.levels)
                            : b.data.properties.levels,
                    j = h.reduce(function (a, b) {
                        return a + b;
                    }),
                    l = b._three._threebox.distaneToWorld(j),
                    m = { steps: 10, units: "kilometers", properties: {} },
                    n = [],
                    o = [],
                    v = [],
                    k = [],
                    p = [],
                    u = [],
                    s = [],
                    q = 0;
                q < g.length;
                q++
            ) {
                var r = [],
                    t = b._three._threebox.projectToWorld(g[q]);
                o.push(t.clone());
                var w = t.clone();
                w.z = l;
                v.push(w.clone());
                r.push(t.clone());
                r.push(w.clone());
                k.push(r);
                p.push(t.clone());
                u.push(t.clone());
                s.push(t.clone());
                r = turf.circle(g[q], 2.0e-4, m);
                n.push(r);
            }
            g = b._createGeoExtrudeGeometry(s, {
                amount: 1.0e-12,
                bevelEnabled: !1,
            });
            m = new THREE.MeshPhongMaterial({
                color: new THREE.Color(this.roofColor),
                transparent: !0,
                opacity: this.roofOpacity,
            });
            g.translate(0, 0, l + 1.0e-6);
            g = new THREE.Mesh(g, m);
            this.isRoofVisible && c.add(g);
            m = new THREE.MeshPhongMaterial({
                color: this.topLineColor,
                transparent: !0,
                opacity: this.topLineOpacity,
            });
            g = new THREE.MeshPhongMaterial({
                color: this.pillarColor,
                transparent: !0,
                opacity: this.pillarOpacity,
            });
            o = b._createLineGeometry(o);
            k = b._createLineGeometry(v);
            v = o.clone();
            new THREE.Line(o, m).name = "linebase";
            o = new THREE.Line(k, m);
            o.name = "lineUp";
            c.add(o);
            l = {
                pillar: { amount: l, bevelEnabled: !1 },
                floor: { amount: 1.0e-12, bevelEnabled: !1 },
            };
            n = b._createPillarMesh(n, l.pillar, g);
            n.name = "pillar";
            this.isPillarVisible && c.add(n);
            n = new THREE.MeshPhongMaterial({
                color: this.floorLinesColor,
                transparent: !0,
                opacity: this.floorLinesOpacity,
            });
            p = b._createGeoExtrudeGeometry(p, l.floor);
            for (o = l = 0; o < h.length; o++)
                (g = b._three._threebox.distaneToWorld(l)),
                    (k = new THREE.MeshPhongMaterial({
                        color: b.originalFloorColor,
                        transparent: !0,
                        opacity: b.originalFloorOpacity,
                        specular: 6454209,
                        shininess: 100,
                    })),
                    (m = new THREE.MeshPhongMaterial({
                        color: b.originalWallColor,
                        transparent: !0,
                        opacity: b.originalWallOpacity,
                        specular: 16776960,
                        shininess: 100,
                        side: THREE.DoubleSide,
                    })),
                    (s = p.clone()),
                    s.translate(0, 0, g),
                    (k = new THREE.Mesh(s, k)),
                    (k.userData.attributes = {
                        OriginalData: b.data,
                        Layer: b,
                        level: o + 1,
                        tag: "__floor__",
                    }),
                    (k.userData.tag = "__floor__"),
                    (k.name = "this is " + (o + 1) + " floor"),
                    c.add(k),
                    b.isFloorLinesVisible &&
                        ((k = v.clone()),
                        k.translate(0, 0, g),
                        (k = new THREE.Line(k, n)),
                        c.add(k)),
                    (k = {
                        amount: b._three._threebox.distaneToWorld(h[o]),
                        bevelEnabled: !1,
                    }),
                    (k = b._createSideGeometry(u, k)),
                    k.translate(0, 0, g),
                    (g = new THREE.Mesh(k, m)),
                    (g.userData.attributes = {
                        OriginalData: b.data,
                        Layer: b,
                        level: o + 1,
                        tag: "__wall__",
                    }),
                    (g.userData.tag = "__wall__"),
                    (g.name = "this is " + (o + 1) + " wall"),
                    c.add(g),
                    (l += h[o]);
            var h = new THREE.MeshBasicMaterial({
                    color: 16777215,
                    transparent: !0,
                    opacity: 1,
                }),
                u = new THREE.SphereBufferGeometry(0.001, 32, 16),
                A = new THREE.Mesh(u, h);
            A.position.copy(b._three._threebox.projectToWorld([e[0], e[1], 0]));
            A.name = "sphereTarget";
            A.scale.copy(
                new THREE.Vector3(1, 1, 1).multiplyScalar(
                    b._three._threebox.projectedUnitsPerMeterInScale(e[1])
                )
            );
            b.lightShown && d.add(A);
            h = new THREE.PointLight(new THREE.Color(b.lightColor), 200, 0);
            h.matrixWorldNeedsUpdate = !0;
            A.add(h);
            b._three._threebox.addGeoreferencedMeshToWorld2(c);
            b._meshes.push(c);
            b._three._threebox.addGeoreferencedMesh(d);
            b._meshes.push(d);
            var d = b._three._threebox.projectToWorld([e[0], e[1], j]),
                j = b._three._threebox.projectToWorld([e[0], e[1], 0]),
                B = new THREE.LineCurve3(j, d),
                z = 0;
            b.lightShown &&
                window.requestAnimationFrame(function (b) {
                    return a(b, 0);
                });
        }
    },
});
GeoGlobe.Visuals.Three.RainLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    options: {},
    getTexture: function (a) {
        return a.texture ? a.texture : "";
    },
    getSize: function (a) {
        return a.size ? a.size : 10;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getSize = a.getSize ? a.getSize : this.getSize;
        this.options = a ? a : this.options;
        this.timer = null;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    setVisible: function (a) {
        this.visible = this.rain.visible = a;
    },
    getVisible: function () {
        return this.visible;
    },
    createRainSprites: function (a) {
        var b = this,
            c = new THREE.Geometry();
        for (i = 0; i < 2e4; i++) {
            var d = new THREE.Vector3();
            d.x = Math.random() * 8e3 - 4e3;
            d.y = Math.random() * 8e3 - 4e3;
            d.z = Math.random() * 4e3;
            d.velocityZ = 6;
            d.velocityX = (Math.random() - 0.5) / 3;
            c.vertices.push(d);
        }
        c.verticesNeedUpdate = !0;
        var d = b.getSize(a),
            e = null;
        (a = b.getTexture(a))
            ? ((e = b._getTextureCacheByURL(a))
                  ? ((e = e.clone()), (e.needsUpdate = !0))
                  : ((e = new THREE.TextureLoader().load(a, function () {
                        b._three._render();
                    })),
                    b._addTextureInToCache({ key: a, value: e })),
              (e = new THREE.PointsMaterial({
                  size: d,
                  map: e,
                  blending: THREE.AdditiveBlending,
                  depthTest: !1,
                  transparent: !0,
                  sizeAttenuation: !0,
                  opacity: b.opacity,
              })))
            : console.error(
                  "\u672a\u8bbe\u7f6e\u7eb9\u7406\u56fe\u7247\u8d44\u6e90\u8def\u5f84\uff01"
              );
        return new THREE.Points(c, e);
    },
    render: function () {
        var a = this;
        a._three._removeInnerLayer(a);
        a._meshes = [];
        if (a.timer) cancelAnimationFrame(a.timer), (a.timer = null);
        var b = a.options;
        a.rain = a.createRainSprites(b);
        a.rain.visible = a.visible;
        a.rain.name = a.id ? a.id : "threelayer";
        a.rain.userData.attributes = { OriginalData: b, Layer: a };
        b = a._three.map.getCenter();
        a._three._threebox.addAtCoordinate(a.rain, [b.lng, b.lat, 0], {
            scaleToLatitude: !0,
            preScale: 1,
        });
        a._meshes.push(a.rain);
        a._three._render();
        (function d() {
            a.timer = requestAnimationFrame(d);
            a.rain.geometry.vertices.forEach(function (a) {
                a.z -= a.velocityZ;
                a.x -= a.velocityX * 0.5;
                if (a.z < 0) a.z = 4e3;
            });
            a.rain.geometry.verticesNeedUpdate = !0;
            a._three._render();
        })();
        a._three.map.on("zoom", function () {
            if (a.getVisible())
                a.rain.visible = a._three.map.getZoom() < 15 ? !1 : !0;
        });
        a._three.map.on("dragend", function () {
            if (a.rain.visible) {
                var b = a._three.map.getCenter();
                a.rain.parent.position.copy(
                    a._three._threebox.projectToWorld([b.lng, b.lat, 0])
                );
            }
        });
    },
    _getTextureCacheByURL: function (a) {
        if (a)
            for (var b = 0; b < this._textureCache.length; b++)
                if (
                    this._textureCache[b].key === a &&
                    this._textureCache[b].value.image
                )
                    return this._textureCache[b].value;
        return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
    },
});
GeoGlobe.Visuals.Three.SnowLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    options: {},
    getTexture: function (a) {
        return a.texture ? a.texture : "";
    },
    getSize: function (a) {
        return a.size ? a.size : 10;
    },
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.getTexture = a.getTexture ? a.getTexture : this.getTexture;
        this.getSize = a.getSize ? a.getSize : this.getSize;
        this.options = a ? a : this.options;
        this.timer = null;
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    setVisible: function (a) {
        this.visible = this.snow.visible = a;
    },
    getVisible: function () {
        return this.visible;
    },
    createSnowSprites: function (a) {
        var b = this,
            c = new THREE.Geometry();
        for (i = 0; i < 2e4; i++) {
            var d = new THREE.Vector3();
            d.x = Math.random() * 8e3 - 4e3;
            d.y = Math.random() * 8e3 - 4e3;
            d.z = Math.random() * 4e3;
            d.velocityZ = 2;
            d.velocityX = (Math.random() - 0.5) / 3;
            c.vertices.push(d);
        }
        c.verticesNeedUpdate = !0;
        var d = b.getSize(a),
            e = null;
        (a = b.getTexture(a))
            ? ((e = b._getTextureCacheByURL(a))
                  ? ((e = e.clone()), (e.needsUpdate = !0))
                  : ((e = new THREE.TextureLoader().load(a, function () {
                        b._three._render();
                    })),
                    b._addTextureInToCache({ key: a, value: e })),
              (e = new THREE.PointsMaterial({
                  size: d,
                  map: e,
                  blending: THREE.AdditiveBlending,
                  depthTest: !1,
                  transparent: !0,
                  sizeAttenuation: !0,
                  opacity: b.opacity,
              })))
            : console.error(
                  "\u672a\u8bbe\u7f6e\u7eb9\u7406\u56fe\u7247\u8d44\u6e90\u8def\u5f84\uff01"
              );
        return new THREE.Points(c, e);
    },
    render: function () {
        var a = this;
        a._three._removeInnerLayer(a);
        a._meshes = [];
        if (a.timer) cancelAnimationFrame(a.timer), (a.timer = null);
        var b = a.options;
        a.snow = a.createSnowSprites(b);
        a.snow.visible = a.visible;
        a.snow.name = a.id ? a.id : "threelayer";
        a.snow.userData.attributes = { OriginalData: b, Layer: a };
        b = a._three.map.getCenter();
        a._three._threebox.addAtCoordinate(a.snow, [b.lng, b.lat, 0], {
            scaleToLatitude: !0,
            preScale: 1,
        });
        a._meshes.push(a.snow);
        a._three._render();
        (function d() {
            a.timer = requestAnimationFrame(d);
            a.snow.geometry.vertices.forEach(function (a) {
                a.z -= a.velocityZ;
                a.x -= a.velocityX * 0.5;
                if (a.z < 0) a.z = 4e3;
            });
            a.snow.geometry.verticesNeedUpdate = !0;
            a._three._render();
        })();
        a._three.map.on("zoom", function () {
            if (a.getVisible())
                a.snow.visible = a._three.map.getZoom() < 15 ? !1 : !0;
        });
        a._three.map.on("dragend", function () {
            if (a.snow.visible) {
                var b = a._three.map.getCenter();
                a.snow.parent.position.copy(
                    a._three._threebox.projectToWorld([b.lng, b.lat, 0])
                );
            }
        });
    },
    _getTextureCacheByURL: function (a) {
        if (a)
            for (var b = 0; b < this._textureCache.length; b++)
                if (
                    this._textureCache[b].key === a &&
                    this._textureCache[b].value.image
                )
                    return this._textureCache[b].value;
        return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
    },
});
GeoGlobe.Visuals.Three.BrightkiteLayer = GeoGlobe.Class4OL({
    id: "1",
    visible: !0,
    opacity: 1,
    name: "\u5b9e\u65f6\u6570\u636e\u670d\u52a1",
    version: "1.0.0",
    format: "json",
    levelPrecision: [8, 8, 8],
    requestArgs: {},
    rendererOptions: {},
    options: {},
    service: "RTDS",
    tileSize: 256,
    _three: null,
    _meshes: [],
    _textureCache: [],
    initialize: function (a) {
        this.options = a ? a : this.options;
        this.textureCoord = [
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 1),
            new THREE.Vector2(1, 1),
        ];
        this.id = a.id ? a.id : this.id;
        this.visible = a.visible !== void 0 ? a.visible : this.visible;
        this.opacity = a.opacity ? a.opacity : this.opacity;
        this.name = a.name ? a.name : this.name;
        this.service = a.service ? a.service : this.service;
        this.tileSize = a.tileSize ? a.tileSize : this.tileSize;
        this.version = a.version ? a.version : this.version;
        this.format = a.format ? a.format : this.format;
        this.levelPrecision = a.levelPrecision
            ? a.levelPrecision
            : this.levelPrecision;
        this.requestArgs = a.requestArgs ? a.requestArgs : this.requestArgs;
        this.rendererOptions = a.rendererOptions
            ? a.rendererOptions
            : this.rendererOptions;
        this.getService = a.getService ? a.getService : this.getService;
        this.projMatrix = new Float64Array(16);
        this.alignedProjMatrix = new Float64Array(16);
        this.pixelMatrix = new Float64Array(16);
        this.pixelMatrixInverse = new Float64Array(16);
        this._initMat4();
        this._initCalculator();
        this.mat4 = new this.mat4();
        this.calculator = new this.calculator();
        "OffscreenCanvas" in window && this._initWorker();
    },
    _initWorker: function () {
        var a = this,
            b,
            c = "\n// debugger\n'use strict';\n\nfunction transformMat4(out, a, m){\n    var x = a[0], y = a[1], z = a[2], w = a[3];\n    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;\n    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;\n    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;\n    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;\n    return out;\n}\n\nfunction zoomTo(column, row, zoom, tileZoom){\n    var scale = Math.pow(2, tileZoom - zoom);\n    column *= scale;\n    row *= scale;\n    zoom = tileZoom;\n\n    return {\n       column: column,\n       row: row,\n       zoom: zoom,\n    };\n}\n\nfunction lngX(lng, transform) {\n\tif(transform._mapCRS) {\n\t\tvar tileExtent = transform._mapCRS.topTileExtent;\n\t\tvar extentWidth = tileExtent[2] - tileExtent[0];\n\t\treturn (lng - tileExtent[0]) * transform.worldSize / extentWidth;\n\t}else{\n\t\treturn (180 + lng) * transform.worldSize / 360;\n\t}\n}\nfunction latY(lat, transform) {\n\tif(transform._mapCRS) {\n\t\tvar tileExtent = transform._mapCRS.topTileExtent;\n\t\tvar extentHeight = tileExtent[3] - tileExtent[1];\n\t\treturn (tileExtent[3] - lat) * transform.worldSize / extentHeight;\n\t}else{\n\t\tvar y = 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));\n\t\treturn (180 - y) * transform.worldSize / 360;\n\t}\n}\n\nfunction locationCoordinate(lnglat, transform){\n    // var column = (180 + lnglat[0]) * transform.worldSize / 360 / transform.tileSize;\n    // var row = (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lnglat[1] * Math.PI / 360)))) * transform.worldSize / 360 / transform.tileSize;\n    var column = lngX(lnglat[0], transform) / transform.tileSize;\n\tvar row = latY(lnglat[1], transform) / transform.tileSize;\n    var zoom = transform.zoom;\n\n    return zoomTo(column, row, zoom, transform.tileZoom);\n}\n\nfunction coordinatePoint(coord, transform){\n    var zoomedCoord = zoomTo(coord.column, coord.row, coord.zoom, transform.zoom);\n    var p = [zoomedCoord.column * transform.tileSize, zoomedCoord.row * transform.tileSize, 0, 1];\n    transformMat4(p, p, transform.pixelMatrix);\n    return {\n        x: p[0] / p[3],\n        y: p[1] / p[3]\n    };\n}\n\nfunction locationPoint(lnglat, transform){\n    return coordinatePoint(locationCoordinate(lnglat, transform), transform);\n}\n\nfunction project(lnglat, transform){\n    return locationPoint(lnglat, transform);\n}\n\n/**\n * \u6839\u636e\u5355\u4e2a\u74e6\u7247URL\u8bf7\u6c42\u77e2\u91cf\u6570\u636e\uff0c\u5e76\u53d1\u8d77\u56de\u8c03\n * @param {Object} requestArgs \u5355\u4e2a\u74e6\u7247\u7684\u5b9e\u65f6\u6570\u636e\u7684\u8bf7\u6c42\u53c2\u6570\n * @param {Function} callback \u8bf7\u6c42\u5b8c\u6210\u540e\u56de\u8c03\u51fd\u6570\n */\nfunction getCanvas(requestArgs, callback) {\n\tvar formData = new FormData();\n    formData.append('SERVICE', 'RTDS');\n    formData.append('VERSION', '"
                .concat(
                    a.version,
                    "');\n    formData.append('REQUEST', 'FeatureAggs');\n    formData.append('FORMAT', '"
                )
                .concat(
                    a.format,
                    "');\n    for(var arg in requestArgs){\n        if(requestArgs.hasOwnProperty(arg)){\n            formData.append(arg.toUpperCase(), requestArgs[arg]);\n        }\n    }\n\n    var url = proxyHost + '"
                )
                .concat(
                    a.service,
                    "?'\n    formData.forEach(function(value, arg) {\n        url += arg + '=' + value + '&';\n    });\n    url = url.slice(0, -1);\n\n\tvar xhr = new XMLHttpRequest();\n\txhr.open('GET', encodeURI(url), true);\n    xhr.responseType = 'json';\n    xhr.send(null);\n\txhr.onreadystatechange = function (e) {\n\t\tif (this.status === 200 && this.readyState === 4) {\n\t\t    callback(this.response);\n\t\t}\n\t};\n}\n\n/**\n * \u5c06\u8bf7\u6c42\u83b7\u5f97\u7684\u5355\u4e2a\u74e6\u7247\u77e2\u91cf\u6570\u636e\u6e32\u67d3\u6210\u6805\u683c\u56fe\u50cf\n * @param {Object} data \u8bf7\u6c42\u5355\u4e2a\u74e6\u7247\u77e2\u91cf\u6570\u636e\u8fd4\u56de\u7684\u7ed3\u679c\n * @param {Object} coordinate \u5355\u4e2a\u74e6\u7247\u884c\u5217\u53f7\n * @param {Object} transform \u5730\u56fe\u53c2\u6570\n * @param {Function} callback \u8bf7\u6c42\u5b8c\u6210\u540e\u56de\u8c03\u51fd\u6570\n*/\nfunction renderToCanvas(data, coordinate, transform, callback) {\n    //\u74e6\u7247\u79bb\u5c4f\u753b\u5e03\uff08266*266\uff09\n    var tileOffscreen = new OffscreenCanvas("
                )
                .concat(a.tileSize, " + 10, ")
                .concat(
                    a.tileSize,
                    ' + 10);\n    var tileOffscreenContext = tileOffscreen.getContext(\'2d\');\n    tileOffscreenContext.globalCompositeOperation = \'lighter\';\n\n\tvar features = [];\n\tdata.forEach(function (elt, i) {\n\t\tfeatures.push({\n\t\t\t"type": "Feature",\n\t\t\t"properties": {name: i, value: elt.value},\n\t\t\t"geometry": {\n\t\t\t\t"type": "Point",\n\t\t\t\t"coordinates": [elt.location.X, elt.location.Y]\n\t\t\t}\n\t\t});\n\t});\n\n\t// \u6c42\u6781\u503c\n\tvar minValue = Number.MAX_VALUE;\n\tvar maxValue = Number.MIN_VALUE;\n\tfor (var k = 0; k < features.length; k++) {\n\t\tif (features[k].properties.value < minValue) minValue = features[k].properties.value;\n\t\tif (features[k].properties.value > maxValue) maxValue = features[k].properties.value;\n\t}\n\t//\u6807\u6ce8\u53c2\u6570\u8ba1\u7b97\n\tfor (var j = 0; j < features.length; j++) {\n\t\t//\u74e6\u7247\u4e0a\u7684\u70b9\u76f8\u5bf9\u4e8e\u753b\u5e03\u7684\u5750\u6807\n\t\tvar point = project([features[j].geometry.coordinates[0], features[j].geometry.coordinates[1]], transform);\n\t\tvar canvasCord = coordinatePoint(coordinate, transform);\n\t\tvar X = point.x - (canvasCord.x-5);\n\t\tvar Y = point.y - (canvasCord.y-5);\n\n\t\t//\u7ed8\u5236\n\t\ttileOffscreenContext.save();\n\t\ttileOffscreenContext.translate(X, Y);\n\t\ttileOffscreenContext.drawImage(spriteOffscreen, -spriteOffscreen.width / 2, -spriteOffscreen.width / 2);\n\t\ttileOffscreenContext.restore();\n\t}\n\n\tvar imgData = tileOffscreenContext.getImageData(5, 5, '
                )
                .concat(a.tileSize, ", ")
                .concat(a.tileSize, ");\n\ttileOffscreen.width = ")
                .concat(a.tileSize, ";\n\ttileOffscreen.height = ")
                .concat(
                    a.tileSize,
                    ";\n\ttileOffscreenContext.putImageData(imgData, 0, 0);\n\tcallback(tileOffscreen);\n}\n\nvar proxyHost;\nvar spriteOffscreen, spriteOffscreenContext;\nself.onmessage = function(e) {\n    if(!e.data.key){\n        proxyHost = e.data.proxyHost;\n\n        //\u5c0f\u7cbe\u7075\u79bb\u5c4f\u753b\u5e03\uff0810*10\uff09\n        spriteOffscreen = new OffscreenCanvas(e.data.size, e.data.size);\n        spriteOffscreenContext = spriteOffscreen.getContext('2d');\n\n        //\u5c0f\u7cbe\u7075\u6807\u6ce8\u989c\u8272\u914d\u7f6e\u6682\u65f6\u53ea\u652f\u6301\u5355\u8272\n        var gradient = spriteOffscreenContext.createRadialGradient(e.data.size / 2, e.data.size / 2, 0, e.data.size / 2, e.data.size / 2, e.data.size / 2);\n        gradient.addColorStop(0.15, e.data.color);\n        gradient.addColorStop(0.5, 'rgba' + e.data.rgbColor.slice(3).split(')')[0] + ',0.15)');\n        gradient.addColorStop(1, 'rgba' + e.data.rgbColor.slice(3).split(')')[0] + ',0)');\n        spriteOffscreenContext.fillStyle = gradient;\n        spriteOffscreenContext.fillRect(0, 0, e.data.size, e.data.size);\n    } else {\n        getCanvas(e.data.requestArgs, function(response){\n            renderToCanvas(response, e.data.coordinate, e.data.transform, function(canvas){\n                var bitmap = canvas.transferToImageBitmap();\n                postMessage({\n                    key: e.data.key,\n                    bitmap: bitmap\n                }, [bitmap]);\n            });\n        });\n    }\n};"
                ),
            c = new Blob([c], { type: "text/javascript" });
        this.workerObjectURL = URL.createObjectURL(c);
        this.worker = new Worker(this.workerObjectURL);
        this.worker.onmessage = function (c) {
            var e = document.createElement("canvas");
            e.width = a.tileSize;
            e.height = a.tileSize;
            e.getContext("bitmaprenderer").transferFromImageBitmap(
                c.data.bitmap
            );
            b = new THREE.CanvasTexture(e);
            a._addTextureInToCache({ key: c.data.key, value: b });
            a._render();
        };
        this.worker.postMessage({
            size: this.rendererOptions.markPoint.symbolMaxSize,
            color: this.rendererOptions.markPoint.color,
            rgbColor: GeoGlobe.Util.getRgbColor(
                this.rendererOptions.markPoint.color
            ),
            proxyHost:
                location.origin +
                "/" +
                location.pathname.split("/")[1] +
                "/proxy?url=",
        });
        URL.revokeObjectURL(this.workerObjectURL);
    },
    addTo: function (a) {
        this._three = a;
        this._three.addLayer(this);
        this._bindEvent();
    },
    remove: function () {
        this._three.removeLayer(this.id);
    },
    _bindEvent: function () {
        var a = this;
        this._three.map.on("moveend", function () {
            a._reDraw();
        });
    },
    _reDraw: function () {
        this.update();
    },
    reDraw: function () {
        this._clearTextureFromCache();
        this.update();
    },
    _unbindEvent: function () {
        for (var a = 0; a < this._three.map._listeners.moveend.length; a++)
            this._three.map._listeners.moveend[a].name &&
                this._three.map._listeners.moveend[a].name ===
                    "BRIGHTKITE_MOVEEND_EVENT" &&
                this._three.map._listeners.moveend.splice(a, 1);
    },
    getTileMesh: function (a, b, c) {
        var d = this._three._threebox.projectToWorld(a[0]),
            e = this._three._threebox.projectToWorld(a[1]),
            f = this._three._threebox.projectToWorld(a[2]),
            a = this._three._threebox.projectToWorld(a[3]),
            e = [d, e, f, a],
            f = [new THREE.Face3(0, 1, 2), new THREE.Face3(0, 2, 3)],
            d = new THREE.Geometry();
        d.vertices = e;
        d.faces = f;
        d.computeFaceNormals();
        d.faceVertexUvs = [[]];
        d.faceVertexUvs[0][0] = [c[2], c[1], c[0]];
        d.faceVertexUvs[0][1] = [c[2], c[0], c[3]];
        b = new THREE.MeshBasicMaterial({
            map: b,
            blending: THREE.AdditiveBlending,
            depthTest: !1,
            transparent: !0,
            opacity: this.opacity,
        });
        return new THREE.Mesh(d, b);
    },
    getTileBBox: function (a, b, c) {
        if (this._three.map._mapCRS) {
            var c = Math.pow(2, c),
                b = c - b - 1,
                d =
                    this._three.map._mapCRS.topTileExtent[2] -
                    this._three.map._mapCRS.topTileExtent[0],
                e =
                    this._three.map._mapCRS.topTileExtent[3] -
                    this._three.map._mapCRS.topTileExtent[1],
                f = this._three.map._mapCRS.topTileExtent[0] + (d * a) / c,
                g = this._three.map._mapCRS.topTileExtent[1] + (e * b) / c,
                d =
                    this._three.map._mapCRS.topTileExtent[0] +
                    (d * (a + 1)) / c,
                e =
                    this._three.map._mapCRS.topTileExtent[1] +
                    (e * (b + 1)) / c;
            return [f, g, d, e];
        } else
            return (
                (c = Math.pow(2, c)),
                (b = c - b - 1),
                (d = -2.00375083427892e7 + (4.00750166855784e7 * (a + 1)) / c),
                (e = -2.00375083427892e7 + (4.00750166855784e7 * (b + 1)) / c),
                (a = GeoGlobe.Util.transferToLonLat([
                    -2.00375083427892e7 + (4.00750166855784e7 * a) / c,
                    -2.00375083427892e7 + (4.00750166855784e7 * b) / c,
                ])),
                (b = GeoGlobe.Util.transferToLonLat([d, e])),
                [a[0], a[1], b[0], b[1]]
            );
    },
    getBiggerTileBBox: function (a, b, c, d) {
        if (this._three.map._mapCRS)
            var c = Math.pow(2, c),
                b = c - b - 1,
                e =
                    this._three.map._mapCRS.topTileExtent[2] -
                    this._three.map._mapCRS.topTileExtent[0],
                f =
                    this._three.map._mapCRS.topTileExtent[3] -
                    this._three.map._mapCRS.topTileExtent[1],
                g = this._three.map._mapCRS.topTileExtent[0] + (e * a) / c,
                h = this._three.map._mapCRS.topTileExtent[1] + (f * b) / c,
                e =
                    this._three.map._mapCRS.topTileExtent[0] +
                    (e * (a + 1)) / c,
                f =
                    this._three.map._mapCRS.topTileExtent[1] +
                    (f * (b + 1)) / c,
                a = [g, h],
                b = [e, f];
        else
            (c = Math.pow(2, c)),
                (b = c - b - 1),
                (e = -2.00375083427892e7 + (4.00750166855784e7 * (a + 1)) / c),
                (f = -2.00375083427892e7 + (4.00750166855784e7 * (b + 1)) / c),
                (a = GeoGlobe.Util.transferToLonLat([
                    -2.00375083427892e7 + (4.00750166855784e7 * a) / c,
                    -2.00375083427892e7 + (4.00750166855784e7 * b) / c,
                ])),
                (b = GeoGlobe.Util.transferToLonLat([e, f]));
        a = this.calculator.project(a, d);
        a.x -= 5;
        a.y = a.y + this.tileSize + 5;
        b = this.calculator.project(b, d);
        b.x = b.x + this.tileSize + 5;
        b.y -= 5;
        a = this.calculator.unproject(a, d);
        b = this.calculator.unproject(b, d);
        return [a.lng, a.lat, b.lng, b.lat];
    },
    getCanvas: function (a, b, c, d, e) {
        var f = this;
        new GeoGlobe.Service.RTDS(this.name, this.service, {
            version: this.version,
            format: this.format,
            coordinate: b,
            key: c,
            transform: d,
        }).featureAggs(
            a,
            function (a, b) {
                var c = f.renderToCanvas(this, a, b.coordinate, b.transform);
                e(c, b.key);
            },
            function () {}
        );
    },
    renderToCanvas: function (a, b, c, d) {
        console.time("renderToCanvas");
        if (!this.markPointCacheCanvas) {
            a = this.rendererOptions.markPoint.symbolMaxSize;
            this.markPointCacheCanvas = document.createElement("canvas");
            this.markPointCacheCanvas.width = a;
            this.markPointCacheCanvas.height = a;
            var e = this.markPointCacheCanvas.getContext("2d"),
                f = GeoGlobe.Util.getRgbColor(
                    this.rendererOptions.markPoint.color
                ),
                g = e.createRadialGradient(
                    a / 2,
                    a / 2,
                    0,
                    a / 2,
                    a / 2,
                    a / 2
                );
            g.addColorStop(0.15, this.rendererOptions.markPoint.color);
            g.addColorStop(0.5, "rgba" + f.slice(3).split(")")[0] + ",0.15)");
            g.addColorStop(1, "rgba" + f.slice(3).split(")")[0] + ",0)");
            e.fillStyle = g;
            e.fillRect(0, 0, a, a);
        }
        a = document.createElement("canvas");
        a.width = this.tileSize + 10;
        a.height = this.tileSize + 10;
        a = a.getContext("2d");
        a.globalCompositeOperation = "lighter";
        var h = [];
        b.forEach(function (a, b) {
            h.push({
                type: "Feature",
                properties: { name: b, value: a.value },
                geometry: {
                    type: "Point",
                    coordinates: [a.location.X, a.location.Y],
                },
            });
        });
        b = Number.MAX_VALUE;
        e = Number.MIN_VALUE;
        for (f = 0; f < h.length; f++) {
            if (h[f].properties.value < b) b = h[f].properties.value;
            if (h[f].properties.value > e) e = h[f].properties.value;
        }
        for (b = 0; b < h.length; b++)
            (f = this.calculator.project(
                [h[b].geometry.coordinates[0], h[b].geometry.coordinates[1]],
                d
            )),
                (g = this.calculator.coordinatePoint(c, d)),
                (e = f.x - (g.x - 5)),
                (f = f.y - (g.y - 5)),
                a.save(),
                a.translate(e, f),
                a.drawImage(
                    this.markPointCacheCanvas,
                    -this.markPointCacheCanvas.width / 2,
                    -this.markPointCacheCanvas.height / 2
                ),
                a.restore();
        c = document.createElement("canvas");
        c.width = this.tileSize;
        c.height = this.tileSize;
        d = c.getContext("2d");
        a = a.getImageData(5, 5, this.tileSize, this.tileSize);
        d.putImageData(a, 0, 0);
        console.timeEnd("renderToCanvas");
        return c;
    },
    createTexture: function (a) {
        var b = document.createElement("canvas");
        b.height = 256;
        b.width = 256;
        b.getContext("2d").drawImage(a, 0, 0);
        return new THREE.CanvasTexture(b);
    },
    url: function (a, b, c, d) {
        return a
            .replace("{z}", String(b))
            .replace("{x}", String(c))
            .replace("{y}", String(d));
    },
    _calcMatrices: function (a) {
        a = a.transform;
        if (a.height) {
            var b = (0.5 / Math.tan(a.fov / 2)) * a.height,
                c = a.fov / 2,
                d = a.x,
                e = a.y,
                f =
                    (Math.cos(Math.PI / 2) *
                        ((Math.sin(c) * b) /
                            Math.sin(Math.PI - Math.PI / 2 - c)) +
                        b) *
                    1.01,
                c = new Float64Array(16);
            this.mat4.perspective(c, a.fov, a.width / a.height, 1, f);
            this.mat4.scale(c, c, [1, -1, 1]);
            this.mat4.translate(c, c, [0, 0, -b]);
            this.mat4.rotateX(c, c, 0);
            this.mat4.rotateZ(c, c, 0);
            this.mat4.translate(c, c, [-d, -e, 0]);
            b =
                a.worldSize /
                (Math.PI *
                    12756274 *
                    Math.abs(Math.cos(a.center.lat * (Math.PI / 180))));
            a.units === "m" &&
                (b = a.worldSize / (a.latRange[1] - a.latRange[0]));
            this.mat4.scale(c, c, [1, 1, b, 1]);
            this.projMatrix = c;
            var b = (a.width % 2) / 2,
                f = (a.height % 2) / 2,
                g = Math.cos(a.angle),
                h = Math.sin(a.angle),
                d = d - Math.round(d) + g * b + h * f,
                e = e - Math.round(e) + g * f + h * b,
                c = new Float64Array(c);
            this.mat4.translate(c, c, [
                d > 0.5 ? d - 1 : d,
                e > 0.5 ? e - 1 : e,
                0,
            ]);
            this.alignedProjMatrix = c;
            c = this.mat4.create();
            this.mat4.scale(c, c, [a.width / 2, -a.height / 2, 1]);
            this.mat4.translate(c, c, [1, -1, 0]);
            this.pixelMatrix = this.mat4.multiply(
                new Float64Array(16),
                c,
                this.projMatrix
            );
            c = this.mat4.invert(new Float64Array(16), this.pixelMatrix);
            if (!c) throw Error("failed to invert matrix");
            this.pixelMatrixInverse = c;
        }
    },
    update: function () {
        var a = this,
            b = a._three.map.transform.coveringTiles({
                tileSize: a.tileSize,
                minzoom: 0,
                maxzoom: 22,
                roundZoom: !0,
            });
        this._calcMatrices(a._three.map);
        var c = {
            pixelMatrix: a.pixelMatrix,
            pixelMatrixInverse: a.pixelMatrixInverse,
            worldSize: a._three.map.transform.worldSize,
            tileSize: a._three.map.transform.tileSize,
            tileZoom: a._three.map.transform.tileZoom,
            zoom: a._three.map.transform.zoom,
        };
        if (this._three.map._mapCRS) c._mapCRS = this._three.map._mapCRS;
        for (var d = 0; d < b.length; d++) {
            var e = a.getBiggerTileBBox(
                    b[d].canonical.x,
                    b[d].canonical.y,
                    b[d].canonical.z,
                    c
                ),
                f = 8;
            a.levelPrecision[b[d].canonical.z - 1] &&
                (f = a.levelPrecision[b[d].canonical.z - 1]);
            a.requestArgs.precision = f;
            a.requestArgs.bbox = JSON.stringify(e);
            e = b[d].toCoordinate();
            e.column -= 1;
            var f = b[d].key,
                g = a._getTextureCacheByTileId(f);
            g ||
                ("OffscreenCanvas" in window
                    ? a.worker.postMessage({
                          key: f,
                          coordinate: e,
                          requestArgs: a.requestArgs,
                          transform: c,
                      })
                    : a.getCanvas(a.requestArgs, e, f, c, function (b, c) {
                          g = new THREE.CanvasTexture(b);
                          a._addTextureInToCache({ key: c, value: g });
                          a._render();
                      }));
        }
        a._render();
    },
    _render: function () {
        this._three._removeInnerLayer(this);
        this._meshes = [];
        for (
            var a = this._three.map.transform.coveringTiles({
                    tileSize: this.tileSize,
                    minzoom: 0,
                    maxzoom: 22,
                    roundZoom: !0,
                }),
                b = 0;
            b < a.length;
            b++
        ) {
            var c = this.getTileBBox(
                    a[b].canonical.x,
                    a[b].canonical.y,
                    a[b].canonical.z
                ),
                c = [c[0], c[1], c[2], c[3]],
                c = [
                    [c[0], c[3]],
                    [c[0], c[1]],
                    [c[2], c[1]],
                    [c[2], c[3]],
                ],
                d = this._getTextureCacheByTileId(a[b].key);
            if (d)
                (c = this.getTileMesh(c, d, this.textureCoord)),
                    (c.visible = this.visible),
                    (c.name = this.id ? this.id : "BrightkiteLayer"),
                    (c.userData.attributes = {
                        OriginalData: this.options,
                        Layer: this,
                    }),
                    this._three._threebox.addGeoreferencedMeshToWorld2(c),
                    this._meshes.push(c);
        }
        this._three._render();
    },
    render: function () {
        this.update();
    },
    setVisibility: function (a) {
        a == void 0 && (a = !1);
        if (this.visible !== a)
            (this.visible = a),
                this.visible === !0
                    ? (this._bindEvent(), this.render())
                    : (this._unbindEvent(), this._render());
    },
    _getTextureCacheByTileId: function (a) {
        if (a)
            for (var b = 0; b < this._textureCache.length; b++)
                if (
                    this._textureCache[b].key === a &&
                    this._textureCache[b].value.image
                )
                    return this._textureCache[b].value;
        return null;
    },
    _addTextureInToCache: function (a) {
        for (var b = !1, c = 0; c < this._textureCache.length; c++)
            if (this._textureCache[c].key === a.key) {
                b = !0;
                break;
            }
        b || this._textureCache.push(a);
        this._textureCache.length > 1e3 &&
            this._textureCache.splice(0, this._textureCache.length - 1e3);
    },
    _clearTextureFromCache: function () {
        this._textureCache = [];
    },
    _initCalculator: function () {
        this.calculator = function () {};
        this.calculator.prototype = {
            project: function (a, b) {
                return this.locationPoint(a, b);
            },
            unproject: function (a, b) {
                return this.pointLocation(a, b);
            },
            pointLocation: function (a, b) {
                return this.coordinateLocation(this.pointCoordinate(a, b), b);
            },
            coordinateLocation: function (a, b) {
                var c = this.zoomTo(a.column, a.row, a.zoom, b.zoom),
                    d = this.xLng(c.column * b.tileSize, b),
                    c = this.yLat(c.row * b.tileSize, b);
                return { lng: d, lat: c };
            },
            xLng: function (a, b) {
                if (b._mapCRS) {
                    var c = b._mapCRS.topTileExtent;
                    return (a * (c[2] - c[0])) / b.worldSize + c[0];
                } else return (a * 360) / b.worldSize - 180;
            },
            yLat: function (a, b) {
                if (b._mapCRS) {
                    var c = b._mapCRS.topTileExtent;
                    return c[3] - (a * (c[3] - c[1])) / b.worldSize;
                } else
                    return (
                        (360 / Math.PI) *
                            Math.atan(
                                Math.exp(
                                    ((180 - (a * 360) / b.worldSize) *
                                        Math.PI) /
                                        180
                                )
                            ) -
                        90
                    );
            },
            lngX: function (a, b) {
                if (b._mapCRS) {
                    var c = b._mapCRS.topTileExtent;
                    return ((a - c[0]) * b.worldSize) / (c[2] - c[0]);
                } else return ((180 + a) * b.worldSize) / 360;
            },
            latY: function (a, b) {
                if (b._mapCRS) {
                    var c = b._mapCRS.topTileExtent;
                    return ((c[3] - a) * b.worldSize) / (c[3] - c[1]);
                } else
                    return (
                        ((180 -
                            (180 / Math.PI) *
                                Math.log(
                                    Math.tan(Math.PI / 4 + (a * Math.PI) / 360)
                                )) *
                            b.worldSize) /
                        360
                    );
            },
            pointCoordinate: function (a, b) {
                var c = b.tileZoom,
                    d = [a.x, a.y, 0, 1],
                    e = [a.x, a.y, 1, 1];
                this.transformMat4(d, d, b.pixelMatrixInverse);
                this.transformMat4(e, e, b.pixelMatrixInverse);
                var f = d[3],
                    g = e[3],
                    h = d[1] / f,
                    j = e[1] / g,
                    l = d[2] / f,
                    m = e[2] / g,
                    l = l === m ? 0 : (0 - l) / (m - l),
                    d = {
                        column: this.interp(d[0] / f, e[0] / g, l) / b.tileSize,
                        row: this.interp(h, j, l) / b.tileSize,
                        zoom: b.zoom,
                    };
                return this.zoomTo(d.column, d.row, d.zoom, c);
            },
            interp: function (a, b, c) {
                return a * (1 - c) + b * c;
            },
            locationPoint: function (a, b) {
                return this.coordinatePoint(this.locationCoordinate(a, b), b);
            },
            coordinatePoint: function (a, b) {
                var c = this.zoomTo(a.column, a.row, a.zoom, b.zoom),
                    c = [c.column * b.tileSize, c.row * b.tileSize, 0, 1];
                this.transformMat4(c, c, b.pixelMatrix);
                return { x: c[0] / c[3], y: c[1] / c[3] };
            },
            locationCoordinate: function (a, b) {
                var c = this.lngX(a[0], b) / b.tileSize,
                    d = this.latY(a[1], b) / b.tileSize;
                return this.zoomTo(c, d, b.zoom, b.tileZoom);
            },
            zoomTo: function (a, b, c, d) {
                c = Math.pow(2, d - c);
                a *= c;
                b *= c;
                return { column: a, row: b, zoom: d };
            },
            transformMat4: function (a, b, c) {
                var d = b[0],
                    e = b[1],
                    f = b[2],
                    b = b[3];
                a[0] = c[0] * d + c[4] * e + c[8] * f + c[12] * b;
                a[1] = c[1] * d + c[5] * e + c[9] * f + c[13] * b;
                a[2] = c[2] * d + c[6] * e + c[10] * f + c[14] * b;
                a[3] = c[3] * d + c[7] * e + c[11] * f + c[15] * b;
                return a;
            },
        };
    },
    _initMat4: function () {
        this.mat4 = function () {};
        this.mat4.prototype = {
            create: function () {
                var a = new Float32Array(16);
                a[0] = 1;
                a[1] = 0;
                a[2] = 0;
                a[3] = 0;
                a[4] = 0;
                a[5] = 1;
                a[6] = 0;
                a[7] = 0;
                a[8] = 0;
                a[9] = 0;
                a[10] = 1;
                a[11] = 0;
                a[12] = 0;
                a[13] = 0;
                a[14] = 0;
                a[15] = 1;
                return a;
            },
            identity: function (a) {
                a[0] = 1;
                a[1] = 0;
                a[2] = 0;
                a[3] = 0;
                a[4] = 0;
                a[5] = 1;
                a[6] = 0;
                a[7] = 0;
                a[8] = 0;
                a[9] = 0;
                a[10] = 1;
                a[11] = 0;
                a[12] = 0;
                a[13] = 0;
                a[14] = 0;
                a[15] = 1;
                return a;
            },
            translate: function (a, b, c) {
                var d = c[0],
                    e = c[1],
                    c = c[2],
                    f,
                    g,
                    h,
                    j,
                    l,
                    m,
                    n,
                    o,
                    v,
                    k,
                    p,
                    u;
                b === a
                    ? ((a[12] = b[0] * d + b[4] * e + b[8] * c + b[12]),
                      (a[13] = b[1] * d + b[5] * e + b[9] * c + b[13]),
                      (a[14] = b[2] * d + b[6] * e + b[10] * c + b[14]),
                      (a[15] = b[3] * d + b[7] * e + b[11] * c + b[15]))
                    : ((f = b[0]),
                      (g = b[1]),
                      (h = b[2]),
                      (j = b[3]),
                      (l = b[4]),
                      (m = b[5]),
                      (n = b[6]),
                      (o = b[7]),
                      (v = b[8]),
                      (k = b[9]),
                      (p = b[10]),
                      (u = b[11]),
                      (a[0] = f),
                      (a[1] = g),
                      (a[2] = h),
                      (a[3] = j),
                      (a[4] = l),
                      (a[5] = m),
                      (a[6] = n),
                      (a[7] = o),
                      (a[8] = v),
                      (a[9] = k),
                      (a[10] = p),
                      (a[11] = u),
                      (a[12] = f * d + l * e + v * c + b[12]),
                      (a[13] = g * d + m * e + k * c + b[13]),
                      (a[14] = h * d + n * e + p * c + b[14]),
                      (a[15] = j * d + o * e + u * c + b[15]));
                return a;
            },
            scale: function (a, b, c) {
                var d = c[0],
                    e = c[1],
                    c = c[2];
                a[0] = b[0] * d;
                a[1] = b[1] * d;
                a[2] = b[2] * d;
                a[3] = b[3] * d;
                a[4] = b[4] * e;
                a[5] = b[5] * e;
                a[6] = b[6] * e;
                a[7] = b[7] * e;
                a[8] = b[8] * c;
                a[9] = b[9] * c;
                a[10] = b[10] * c;
                a[11] = b[11] * c;
                a[12] = b[12];
                a[13] = b[13];
                a[14] = b[14];
                a[15] = b[15];
                return a;
            },
            multiply: function (a, b, c) {
                var d = b[0],
                    e = b[1],
                    f = b[2],
                    g = b[3],
                    h = b[4],
                    j = b[5],
                    l = b[6],
                    m = b[7],
                    n = b[8],
                    o = b[9],
                    v = b[10],
                    k = b[11],
                    p = b[12],
                    u = b[13],
                    s = b[14],
                    b = b[15],
                    q = c[0],
                    r = c[1],
                    t = c[2],
                    w = c[3];
                a[0] = q * d + r * h + t * n + w * p;
                a[1] = q * e + r * j + t * o + w * u;
                a[2] = q * f + r * l + t * v + w * s;
                a[3] = q * g + r * m + t * k + w * b;
                q = c[4];
                r = c[5];
                t = c[6];
                w = c[7];
                a[4] = q * d + r * h + t * n + w * p;
                a[5] = q * e + r * j + t * o + w * u;
                a[6] = q * f + r * l + t * v + w * s;
                a[7] = q * g + r * m + t * k + w * b;
                q = c[8];
                r = c[9];
                t = c[10];
                w = c[11];
                a[8] = q * d + r * h + t * n + w * p;
                a[9] = q * e + r * j + t * o + w * u;
                a[10] = q * f + r * l + t * v + w * s;
                a[11] = q * g + r * m + t * k + w * b;
                q = c[12];
                r = c[13];
                t = c[14];
                w = c[15];
                a[12] = q * d + r * h + t * n + w * p;
                a[13] = q * e + r * j + t * o + w * u;
                a[14] = q * f + r * l + t * v + w * s;
                a[15] = q * g + r * m + t * k + w * b;
                return a;
            },
            perspective: function (a, b, c, d, e) {
                var b = 1 / Math.tan(b / 2),
                    f = 1 / (d - e);
                a[0] = b / c;
                a[1] = 0;
                a[2] = 0;
                a[3] = 0;
                a[4] = 0;
                a[5] = b;
                a[6] = 0;
                a[7] = 0;
                a[8] = 0;
                a[9] = 0;
                a[10] = (e + d) * f;
                a[11] = -1;
                a[12] = 0;
                a[13] = 0;
                a[14] = 2 * e * d * f;
                a[15] = 0;
                return a;
            },
            rotateX: function (a, b, c) {
                var d = Math.sin(c),
                    c = Math.cos(c),
                    e = b[4],
                    f = b[5],
                    g = b[6],
                    h = b[7],
                    j = b[8],
                    l = b[9],
                    m = b[10],
                    n = b[11];
                b !== a &&
                    ((a[0] = b[0]),
                    (a[1] = b[1]),
                    (a[2] = b[2]),
                    (a[3] = b[3]),
                    (a[12] = b[12]),
                    (a[13] = b[13]),
                    (a[14] = b[14]),
                    (a[15] = b[15]));
                a[4] = e * c + j * d;
                a[5] = f * c + l * d;
                a[6] = g * c + m * d;
                a[7] = h * c + n * d;
                a[8] = j * c - e * d;
                a[9] = l * c - f * d;
                a[10] = m * c - g * d;
                a[11] = n * c - h * d;
                return a;
            },
            rotateZ: function (a, b, c) {
                var d = Math.sin(c),
                    c = Math.cos(c),
                    e = b[0],
                    f = b[1],
                    g = b[2],
                    h = b[3],
                    j = b[4],
                    l = b[5],
                    m = b[6],
                    n = b[7];
                b !== a &&
                    ((a[8] = b[8]),
                    (a[9] = b[9]),
                    (a[10] = b[10]),
                    (a[11] = b[11]),
                    (a[12] = b[12]),
                    (a[13] = b[13]),
                    (a[14] = b[14]),
                    (a[15] = b[15]));
                a[0] = e * c + j * d;
                a[1] = f * c + l * d;
                a[2] = g * c + m * d;
                a[3] = h * c + n * d;
                a[4] = j * c - e * d;
                a[5] = l * c - f * d;
                a[6] = m * c - g * d;
                a[7] = n * c - h * d;
                return a;
            },
            invert: function (a, b) {
                var c = b[0],
                    d = b[1],
                    e = b[2],
                    f = b[3],
                    g = b[4],
                    h = b[5],
                    j = b[6],
                    l = b[7],
                    m = b[8],
                    n = b[9],
                    o = b[10],
                    v = b[11],
                    k = b[12],
                    p = b[13],
                    u = b[14],
                    s = b[15],
                    q = c * h - d * g,
                    r = c * j - e * g,
                    t = c * l - f * g,
                    w = d * j - e * h,
                    A = d * l - f * h,
                    B = e * l - f * j,
                    z = m * p - n * k,
                    y = m * u - o * k,
                    x = m * s - v * k,
                    D = n * u - o * p,
                    E = n * s - v * p,
                    F = o * s - v * u,
                    C = q * F - r * E + t * D + w * x - A * y + B * z;
                if (!C) return null;
                C = 1 / C;
                a[0] = (h * F - j * E + l * D) * C;
                a[1] = (e * E - d * F - f * D) * C;
                a[2] = (p * B - u * A + s * w) * C;
                a[3] = (o * A - n * B - v * w) * C;
                a[4] = (j * x - g * F - l * y) * C;
                a[5] = (c * F - e * x + f * y) * C;
                a[6] = (u * t - k * B - s * r) * C;
                a[7] = (m * B - o * t + v * r) * C;
                a[8] = (g * E - h * x + l * z) * C;
                a[9] = (d * x - c * E - f * z) * C;
                a[10] = (k * A - p * t + s * q) * C;
                a[11] = (n * t - m * A - v * q) * C;
                a[12] = (h * y - g * D - j * z) * C;
                a[13] = (c * D - d * y + e * z) * C;
                a[14] = (p * r - k * w - u * q) * C;
                a[15] = (m * w - n * r + o * q) * C;
                return a;
            },
            ortho: function (a, b, c, d, e, f, g) {
                var h = 1 / (b - c),
                    j = 1 / (d - e),
                    l = 1 / (f - g);
                a[0] = -2 * h;
                a[1] = 0;
                a[2] = 0;
                a[3] = 0;
                a[4] = 0;
                a[5] = -2 * j;
                a[6] = 0;
                a[7] = 0;
                a[8] = 0;
                a[9] = 0;
                a[10] = 2 * l;
                a[11] = 0;
                a[12] = (b + c) * h;
                a[13] = (e + d) * j;
                a[14] = (g + f) * l;
                a[15] = 1;
                return a;
            },
        };
    },
});
