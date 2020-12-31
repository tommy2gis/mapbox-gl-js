import CustomLayer from './CustomLayer';
import {mat4} from 'gl-matrix';
import {mercatorXfromLng,mercatorYfromLat, mercatorZfromAltitude} from '../geo/mercator_coordinate';
var zn =
"\nprecision mediump float;\n\nattribute vec2 a_pos;\n\nvarying vec2 v_pos;\nvarying vec2 v_uv;\n\n// 对象转换方式\nuniform mat4 u_matrix;\nuniform mat4 u_obj_matrix;\nuniform mat4 u_rotate_matrix;\n\nvoid main() {\n    gl_Position = u_matrix * u_obj_matrix * u_rotate_matrix * vec4(a_pos, 0.0, 1.0);\n\n    v_pos = a_pos;\n    v_uv = a_pos * 0.5 + vec2(0.5, 0.5);\n}\n",
Rn =
"\nprecision mediump float;\n\nvarying vec2 v_pos;\nvarying vec2 v_uv;\n\nuniform sampler2D u_sampler;\nuniform vec4 u_color;\n\nvoid main() {\n    if (length(v_pos) > 1.0) {\n        discard;\n    }\n\n    vec4 color = texture2D(u_sampler, v_uv);\n    gl_FragColor = color * u_color;\n}\n",
ImageCircle = (function (e) {
function r(r) {
  var i = this,
    o = r.id,
    n = r.position,
    a = r.radius,
    s = r.url,
    l = r.color;
  void 0 === l && (l = "white");
  var c = r.reverse;
  if ((void 0 === c && (c = !1), !(o && n && a && s)))
    throw new Error("ImageCircle：缺少必备参数");
  var u = new window.Image();
  u.crossOrigin = "anonymous";
  var h = null,
    p = 0;
  e.call(this, {
    id: o,
    programs: {
      vs: zn,
      fs: Rn,
      indices: new Uint16Array([0, 2, 1, 1, 2, 3]),
      attributes: [
        {
          members: [{ name: "a_pos", type: "Float32", components: 2 }],
          data: new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]),
        },
      ],
      uniforms: [
        { name: "u_color", type: "color", accessor: l },
        { name: "u_sampler", type: "image", accessor: u },
        {
          name: "u_obj_matrix",
          type: "mat4",
          accessor: function (e) {
            if (!h) {
              var i = mercatorXfromLng(n[0]),
                o = mercatorYfromLat(n[1]),
                s = mercatorZfromAltitude(a, n[1]),
                l = mat4.create();
                mat4.translate(l, l, [i, o, 0]),
                mat4.scale(l, l, [s, -s, 1]),
                (h = l);
            }
            return h;
          },
        },
        {
          name: "u_rotate_matrix",
          type: "mat4",
          accessor: function () {
            var e = mat4.create();
            return (
              (p += c ? 1 : -1), mat4.rotateZ(e, e, (p / 180) * Math.PI), e
            );
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
  }),
    (u.onload = function () {
      i.imageLoaded = !0;
    }),
    (u.src = s);
}
return (
  e && (r.__proto__ = e),
  (r.prototype = Object.create(e && e.prototype)),
  (r.prototype.constructor = r),
  (r.prototype.render = function (t, r) {
    this.imageLoaded && e.prototype.render.call(this, t, r);
  }),
  (r.prototype.afterRender = function () {
    this.map.triggerRepaint();
  }),
  r
);
})(CustomLayer)

export default  ImageCircle