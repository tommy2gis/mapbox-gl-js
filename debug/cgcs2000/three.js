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
                    l =0.5,
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
                (g = 0.5),
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
                        amount: 0.5,
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