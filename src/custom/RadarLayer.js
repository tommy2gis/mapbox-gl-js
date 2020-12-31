import CustomLayer from './CustomLayer';
import {mercatorXfromLng,mercatorYfromLat, mercatorZfromAltitude} from '../geo/mercator_coordinate';
var Sn =
        "\nprecision mediump float;\n\n// 角度\nattribute float a_angle;\n// 根据角度算出的弧度百分比\nattribute float a_opacity;\n\n// 中心点坐标\nuniform vec2 u_pos;\n// 扇形半径\nuniform float u_radius;\n// 起始弧度\nuniform float u_start_angle;\n// 逆时针旋转\nuniform bool u_reverse;\nuniform mat4 u_matrix;\n\nvarying float v_opacity;\n\nvec2 getPoint(const vec2 pos, const float angle, const float radius) {\n    float x = sin(angle) * radius;\n    float y = cos(angle) * radius;\n    return vec2(x + pos.x, pos.y - y);\n}\n\nvoid main() {\n    vec2 pos = u_pos;\n    if (a_angle != -1.0) {\n        // 旋转方向\n        float angle = u_start_angle + a_angle;\n        // 是否反向旋转\n        if (u_reverse) {\n            angle = -u_start_angle + a_angle;\n        }\n        pos = getPoint(u_pos, angle, u_radius);\n    }\n    gl_Position = u_matrix * vec4(pos, 0.0, 1.0);\n\n    // 非顶点\n    if (a_angle != -1.0 && u_reverse) {\n        v_opacity = 1.0 - a_opacity;\n    } else {\n        v_opacity = a_opacity;\n    }\n}\n",
    Pn =
        "\nprecision mediump float;\n\nuniform vec4 u_color;\n\nvarying float v_opacity;\n\nvoid main() {\n    vec4 color = u_color * v_opacity;\n\n    gl_FragColor = color;\n}\n";
var RadarLayer = (function (t) {
    function e(e) {
        var r = e.id,
            i = e.position,
            o = e.radius,
            n = e.reverse;
        void 0 === n && (n = !1);
        var a = e.color,
            s = e.num,
            l = e.angle;
        if (!(r && i && o && a)) throw new Error("radarLayer：缺少必备参数");
        var c = (function (t) {
                var e = t.num;
                void 0 === e && (e = 5);
                var r = t.angle;
                void 0 === r && (r = Math.PI / 6);
                var i = e + 1,
                    o = e - 1,
                    n = new Float32Array(2 * i);
                (n[0] = -1), (n[1] = 0.5);
                for (var a = 1; a < i; a++) {
                    var s = 2 * a;
                    (n[s] = (r / o) * (a - 1)), (n[s + 1] = (a - 1) / o);
                }
                for (
                    var l = new (i > 65535 ? Uint32Array : Uint16Array)(3 * o),
                        c = 0;
                    c < o;
                    c++
                ) {
                    var u = 3 * c;
                    (l[u] = 0), (l[u + 1] = c + 1), (l[u + 2] = c + 2);
                }
                return { POSITION: n, INDICES: l };
            })({ num: s, angle: l }),
            u = c.POSITION,
            h = c.INDICES,
            p = 0;
        t.call(this, {
            id: r,
            programs: {
                vs: Sn,
                fs: Pn,
                indices: h,
                attributes: [
                    {
                        members: [
                            { name: "a_angle", type: "Float32", components: 1 },
                            {
                                name: "a_opacity",
                                type: "Float32",
                                components: 1,
                            },
                        ],
                        data: u,
                    },
                ],
                uniforms: [
                    {
                        name: "u_pos",
                        type: "2f",
                        accessor: function (t) {
                            return [
                                mercatorXfromLng(i[0]),
                                mercatorYfromLat(i[1]),
                            ];
                        },
                    },
                    {
                        name: "u_radius",
                        type: "1f",
                        accessor: function (t) {
                            return mercatorZfromAltitude(o, i[1]);
                        },
                    },
                    {
                        name: "u_start_angle",
                        type: "1f",
                        accessor: function () {
                            return ((p += 1) / 180) * (2 * Math.PI);
                        },
                    },
                    { name: "u_reverse", type: "1i", accessor: +Boolean(n) },
                    { name: "u_color", type: "color", accessor: a },
                    {
                        name: "u_matrix",
                        type: "mat4",
                        accessor: function (t) {
                            return t.matrix;
                        },
                    },
                ],
            },
        });
    }
    return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.prototype.afterRender = function () {
            this.map.triggerRepaint();
        }),
        e
    );
})(CustomLayer);
export default RadarLayer