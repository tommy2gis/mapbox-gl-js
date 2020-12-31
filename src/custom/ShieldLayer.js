import CustomLayer from './CustomLayer';
import {mat4} from 'gl-matrix';
import {mercatorXfromLng,mercatorYfromLat, mercatorZfromAltitude} from '../geo/mercator_coordinate';
var Cn =
        "\nprecision mediump float;\n\nattribute vec3 a_pos;\n\nuniform mat4 u_obj_matrix;\nuniform mat4 u_matrix;\n\nvarying vec3 v_pos;\n\nvoid main() {\n    gl_Position = u_matrix * u_obj_matrix * vec4(a_pos, 1.0);\n\n    v_pos = a_pos;\n}\n",
    Mn =
        "\nprecision mediump float;\n\nuniform vec4 u_color;\n\nvarying vec3 v_pos;\n\n// 菲涅耳公式常量\nconst float _fresnelBase = 0.1;\nconst float _fresnelScale = 1.0;\nconst float _fresnelIndensity = 20.0;\n\nvoid main() {\n    float N = 1.0 - length(v_pos.xy);\n    float V = 1.0 - abs(v_pos.z);\n    \n    // 菲涅耳公式\n    float fresnel = _fresnelBase + _fresnelScale * pow(1.0 - dot(N, V), _fresnelIndensity);\n\n    gl_FragColor = u_color * fresnel;\n}\n",
    ShieldLayer = (function (e) {
        function r(r) {
            var i = r.id,
                o = r.position,
                n = r.radius,
                a = r.color,
                s = r.num;
            if ((void 0 === s && (s = 25), !(i && o && n && a)))
                throw new Error("ShieldLayer：缺少必备参数");
            var l = (function (t) {
                    var e = t.nlat;
                    void 0 === e && (e = 10);
                    var r = t.nlong;
                    void 0 === r && (r = 10);
                    var i = t.startLong;
                    void 0 === i && (i = 0);
                    var o = t.endLong;
                    void 0 === o && (o = 2 * Math.PI);
                    var n = t.radius;
                    void 0 === n && (n = 1);
                    var a = Math.PI - 0,
                        s = o - i,
                        l = (e + 1) * (r + 1);
                    if ("number" == typeof n) {
                        var c = n;
                        n = function () {
                            return c;
                        };
                    }
                    for (
                        var u = new Float32Array(3 * l),
                            h = new Float32Array(3 * l),
                            p = new Float32Array(2 * l),
                            d = new (l > 65535 ? Uint32Array : Uint16Array)(
                                e * r * 6
                            ),
                            f = 0;
                        f <= e;
                        f++
                    )
                        for (var _ = 0; _ <= r; _++) {
                            var m = _ / r,
                                g = f / e,
                                v = _ + f * (r + 1),
                                y = 2 * v,
                                x = 3 * v,
                                b = s * m,
                                w = a * g,
                                E = Math.sin(b),
                                T = Math.cos(b),
                                S = Math.sin(w),
                                P = T * S,
                                I = Math.cos(w),
                                C = E * S,
                                M = n(P, I, C, m, g);
                            (u[x + 0] = M * P),
                                (u[x + 1] = M * I),
                                (u[x + 2] = M * C),
                                (h[x + 0] = P),
                                (h[x + 1] = I),
                                (h[x + 2] = C),
                                (p[y + 0] = m),
                                (p[y + 1] = 1 - g);
                        }
                    for (var L = r + 1, z = 0; z < r; z++)
                        for (var R = 0; R < e; R++) {
                            var A = 6 * (z * e + R);
                            (d[A + 0] = R * L + z),
                                (d[A + 1] = R * L + z + 1),
                                (d[A + 2] = (R + 1) * L + z),
                                (d[A + 3] = (R + 1) * L + z),
                                (d[A + 4] = R * L + z + 1),
                                (d[A + 5] = (R + 1) * L + z + 1);
                        }
                    return {
                        indices: { size: 1, value: d },
                        attributes: {
                            POSITION: { size: 3, value: u },
                            NORMAL: { size: 3, value: h },
                            TEXCOORD_0: { size: 2, value: p },
                        },
                    };
                })({ nlat: s, nlong: 2 * s, endLong: Math.PI }),
                c = l.attributes.POSITION,
                u = l.indices,
                h = null;
            e.call(this, {
                id: i,
                programs: {
                    vs: Cn,
                    fs: Mn,
                    indices: u.value,
                    attributes: [
                        {
                            members: [
                                {
                                    name: "a_pos",
                                    type: "Float32",
                                    components: 3,
                                },
                            ],
                            data: c.value,
                        },
                    ],
                    uniforms: [
                        { name: "u_color", type: "color", accessor: a },
                        {
                            name: "u_obj_matrix",
                            type: "mat4",
                            accessor: function (e) {
                                if (!h) {
                                    var i = mercatorXfromLng(
                                            o[0]
                                        ),
                                        a = mercatorYfromLat(
                                            o[1]
                                        ),
                                        s = mercatorZfromAltitude(
                                            n,
                                            o[1]
                                        ),
                                        l = mat4.create();
                                        mat4.translate(l, l, [i, a, 0]),
                                        mat4.scale(l, l, [s, -s, s]),
                                        (h = l);
                                }
                                return h;
                            },
                        },
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
            e && (r.__proto__ = e),
            (r.prototype = Object.create(e && e.prototype)),
            (r.prototype.constructor = r),
            (r.prototype.beforeRender = function (t) {
                var e = t.gl;
                e.enable(e.CULL_FACE), e.cullFace(e.BACK);
            }),
            (r.prototype.afterRender = function (t) {
                var e = t.gl;
                e.disable(e.CULL_FACE);
            }),
            r
        );
    })(CustomLayer);
export default ShieldLayer;