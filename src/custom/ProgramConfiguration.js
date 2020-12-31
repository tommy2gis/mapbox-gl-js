import VertexBuffer from "./VertexBuffer";
import Color from '../style-spec/util/color';
var sn = function (t, e) {
    (this.gl = t), this.set(e);
};
(sn.prototype.set = function (t) {
    var e = this.gl;
    this.destroy(),
        e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null),
        (this.buffer = e.createBuffer()),
        e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.buffer),
        e.bufferData(e.ELEMENT_ARRAY_BUFFER, t, e.STATIC_DRAW),
        (this.length = t.length);
}),
    (sn.prototype.bind = function () {
        var t = this.gl;
        t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.buffer);
    }),
    (sn.prototype.updateData = function (t) {
        if (t.length === this.length) {
            var e = this.gl;
            this.bind(), e.bufferSubData(e.ELEMENT_ARRAY_BUFFER, 0, t);
        }
    }),
    (sn.prototype.destroy = function () {
        var t = this.gl;
        this.buffer && (t.deleteBuffer(this.buffer), delete this.buffer);
    });

var un = function (t, e) {
    (this.gl = t), (this.location = e);
};
un.prototype.update = function (t) {
    if (this.accessor) {
        var e = this.accessor;
        "function" == typeof this.accessor && (e = this.accessor(t)),
            this.set(e);
    }
};
var hn = (function (t) {
        function e(e, r) {
            t.call(this, e, r), (this.current = 0);
        }
        return (
            t && (e.__proto__ = t),
            (e.prototype = Object.create(t && t.prototype)),
            (e.prototype.constructor = e),
            (e.prototype.set = function (t) {
                this.current !== t &&
                    ((this.current = t), this.gl.uniform1i(this.location, t));
            }),
            e
        );
    })(un),
    pn = (function (t) {
        function e(e, r) {
            t.call(this, e, r), (this.current = 0);
        }
        return (
            t && (e.__proto__ = t),
            (e.prototype = Object.create(t && t.prototype)),
            (e.prototype.constructor = e),
            (e.prototype.set = function (t) {
                this.current !== t &&
                    ((this.current = t), this.gl.uniform1f(this.location, t));
            }),
            e
        );
    })(un),
    dn = (function (t) {
    function e(e, r) {
        t.call(this, e, r), (this.current = [0, 0]);
    }
    return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.prototype.set = function (t) {
            (t[0] === this.current[0] && t[1] === this.current[1]) ||
                ((this.current = t),
                this.gl.uniform2f(this.location, t[0], t[1]));
        }),
        e
    );
})(un),
    fn = (function (t) {
        function e(e, r) {
            t.call(this, e, r), (this.current = [0, 0, 0]);
        }
        return (
            t && (e.__proto__ = t),
            (e.prototype = Object.create(t && t.prototype)),
            (e.prototype.constructor = e),
            (e.prototype.set = function (t) {
                (t[0] === this.current[0] &&
                    t[1] === this.current[1] &&
                    t[2] === this.current[2]) ||
                    ((this.current = t),
                    this.gl.uniform3f(this.location, t[0], t[1], t[2]));
            }),
            e
        );
    })(un),
_n = (function (t) {
    function e(e, r) {
        t.call(this, e, r), (this.current = [0, 0, 0, 0]);
    }
    return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.prototype.set = function (t) {
            (t[0] === this.current[0] &&
                t[1] === this.current[1] &&
                t[2] === this.current[2] &&
                t[3] === this.current[3]) ||
                ((this.current = t),
                this.gl.uniform4f(this.location, t[0], t[1], t[2], t[3]));
        }),
        e
    );
})(un),
mn = (function (e) {
    function r(r, i) {
        e.call(this, r, i), (this.current = Color.transparent);
    }
    return (
        e && (r.__proto__ = e),
        (r.prototype = Object.create(e && e.prototype)),
        (r.prototype.constructor = r),
        (r.prototype.set = function (e) {
            ((e =
                Color.parse(e) || Color.transparent)
                .r === this.current.r &&
                e.g === this.current.g &&
                e.b === this.current.b &&
                e.a === this.current.a) ||
                ((this.current = e),
                this.gl.uniform4f(this.location, e.r, e.g, e.b, e.a));
        }),
        r
    );
})(un),
gn = (function (t) {
    function e(e, r) {
        t.call(this, e, r),
            (this.current = new Image()),
            (this.texture = e.createTexture());
    }
    return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.prototype.set = function (t) {
            var e = this.gl;
            this.current !== t
                ? (e.activeTexture(e.TEXTURE0),
                  e.bindTexture(e.TEXTURE_2D, this.texture),
                  e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, 1),
                  e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1),
                  e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR),
                  e.texImage2D(
                      e.TEXTURE_2D,
                      0,
                      e.RGBA,
                      e.RGBA,
                      e.UNSIGNED_BYTE,
                      t
                  ),
                  (this.current = t),
                  e.uniform1i(this.location, 0))
                : (e.activeTexture(e.TEXTURE0),
                  e.bindTexture(e.TEXTURE_2D, this.texture));
        }),
        e
    );
})(un),
vn = new Float32Array(16),
yn = {
    "1i": hn,
    "1f": pn,
    "2f": dn,
    "3f": fn,
    "4f": _n,
    color: mn,
    image: gn,
    mat4: (function (t) {
        function e(e, r) {
            t.call(this, e, r), (this.current = vn);
        }
        return (
            t && (e.__proto__ = t),
            (e.prototype = Object.create(t && t.prototype)),
            (e.prototype.constructor = e),
            (e.prototype.set = function (t) {
                if (t[12] !== this.current[12] || t[0] !== this.current[0])
                    return (
                        (this.current = t),
                        void this.gl.uniformMatrix4fv(this.location, !1, t)
                    );
                for (var e = 1; e < 16; e++)
                    if (t[e] !== this.current[e]) {
                        (this.current = t),
                            this.gl.uniformMatrix4fv(this.location, !1, t);
                        break;
                    }
            }),
            e
        );
    })(un),
};

import { createLayout } from "../util/struct_array";
var ProgramConfiguration = function (t, e) {
    (this.attributes = {}), (this.buffers = t || []), (this.binders = e || {});
};
var En = { vertexCount: { configurable: !0 } };
En.vertexCount.get = function () {
    var t = 0;
    return this.indexBuffer && (t = this.indexBuffer.length), t;
};
ProgramConfiguration.createProgramConfiguration = function (e) {
    var r = (function (e) {
            for (
                var r = [], i = 0, o = e.options.attributes || [];
                i < o.length;
                i += 1
            ) {
                var n = o[i],
                    a = n.members,
                    s = n.data,
                    l = new VertexBuffer(e.gl, s, createLayout(a, 1));
                r.push(l);
            }
            return r;
        })(e),
        i = (function (t) {
            for (
                var e = t.options.uniforms || [],
                    r = {},
                    i = (function (t, e) {
                        for (
                            var r = {},
                                i = t.getProgramParameter(e, t.ACTIVE_UNIFORMS),
                                o = 0;
                            o < i;
                            o++
                        ) {
                            var n = t.getActiveUniform(e, o);
                            n && (r[n.name] = t.getUniformLocation(e, n.name));
                        }
                        return r;
                    })(t.gl, t.program),
                    o = 0,
                    n = e;
                o < n.length;
                o += 1
            ) {
                var a = n[o],
                    s = a.name,
                    l = a.type,
                    c = a.accessor,
                    u = i[s],
                    h = yn[l];
                if (u && h) {
                    var p = new h(t.gl, u);
                    (p.accessor = c), (r[s] = p);
                }
            }
            return r;
        })(e),
        o = new ProgramConfiguration(r, i);
    return (
        (o.gl = e.gl),
        (o.attributes = (function (t, e) {
            for (
                var r = {},
                    i = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES),
                    o = 0;
                o < i;
                o++
            ) {
                var n = t.getActiveAttrib(e, o);
                n && (r[n.name] = t.getAttribLocation(e, n.name));
            }
            return r;
        })(e.gl, e.program)),
        e.options.indices && o.setIndexData(e.options.indices),
        o
    );
};
ProgramConfiguration.prototype.bind = function (t) {
    for (var e in (this.freshBind(),
    this.indexBuffer && this.indexBuffer.bind(),
    this.binders)) {
        this.binders[e].update(t);
    }
};
ProgramConfiguration.prototype.freshBind = function () {
    for (var t = 0, e = this.buffers; t < e.length; t += 1) {
        var r = e[t];
        r.bind(),
            r.enableAttributes(this.attributes),
            r.setVertexAttribPointers(this.attributes);
    }
};
ProgramConfiguration.prototype.setBufferData = function (t, e) {
    var r = this.buffers[t];
    r && r.set(e);
};
ProgramConfiguration.prototype.setIndexData = function (t) {
    var e = this.indexBuffer;
    e && t ? e.set(t) : (this.indexBuffer = new sn(this.gl, t));
};
ProgramConfiguration.prototype.destroy = function () {
    for (var t = 0, e = this.buffers; t < e.length; t += 1) {
        e[t].destroy();
    }
    this.indexBuffer && this.indexBuffer.destroy(),
        delete this.gl,
        delete this.attributes,
        delete this.buffers,
        delete this.indexBuffer,
        delete this.binders;
};
Object.defineProperties(ProgramConfiguration.prototype, En);

export default ProgramConfiguration;
