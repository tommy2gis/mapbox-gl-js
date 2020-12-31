const primitiveSize = {
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6,
  }
class CustomProgram {
    constructor(gl, options) {
        this.options = options;
        this.id = options.id;
        this.drawMode =
            void 0 !== primitiveSize[options.drawMode]
                ? primitiveSize[options.drawMode]
                : primitiveSize.TRIANGLES;
        this.gl = gl;
        this.program = this.creatProgram(gl, options.vs, options.fs);
    }

    creatProgram(gl, vertexSource, fragmentSource) {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        var program = gl.createProgram();
        return (
            gl.attachShader(program, vertexShader),
            gl.attachShader(program, fragmentShader),
            gl.linkProgram(program),
            gl.validateProgram(program),
            program
        );
    }

    active() {
        this.gl.useProgram(this.program);
    }
    draw(t, config) {
        var gl = this.gl;
        config.bind(t);
        gl.drawElements(
            this.drawMode,
            config.vertexCount,
            gl.UNSIGNED_SHORT,
            0
        );
    }
    destroy() {
        this.gl.deleteProgram(this.program);
        delete this.gl;
        delete this.program;
        delete this.options;
    }
}

export default CustomProgram;
