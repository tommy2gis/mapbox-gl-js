const AttributeType = {
    Int8: "BYTE",
    Uint8: "UNSIGNED_BYTE",
    Int16: "SHORT",
    Uint16: "UNSIGNED_SHORT",
    Int32: "INT",
    Uint32: "UNSIGNED_INT",
    Float32: "FLOAT",
};
const VertexBuffer = function (gl, arrayBuffer, layerout) {
    this.gl = gl;
    this.attributes = layerout.members;
    this.itemSize = layerout.size;
    this.set(arrayBuffer);
};
VertexBuffer.prototype.set = function (arrayBuffer) {
    var gl = this.gl;
    this.destroy();
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, arrayBuffer, gl.STATIC_DRAW);
    this.length = arrayBuffer.length;
};
VertexBuffer.prototype.bind = function () {
    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
};
VertexBuffer.prototype.updateData = function (arrayBuffer) {
    if (arrayBuffer.length === this.length) {
        var gl = this.gl;
        this.bind(), gl.bufferSubData(gl.ARRAY_BUFFER, 0, arrayBuffer);
    }
};
VertexBuffer.prototype.enableAttributes = function (attribute) {
    for (var gl = this.gl, r = 0; r < this.attributes.length; r++) {
        var attribIndex = attribute[this.attributes[r].name];
        if (attribIndex !== undefined) {
            gl.enableVertexAttribArray(attribIndex);
        }
    }
};
VertexBuffer.prototype.setVertexAttribPointers = function (attributes) {
    var gl = this.gl;
    for (let j = 0; j < this.attributes.length; j++) {
        const member = this.attributes[j];
        const attribIndex = attributes[member.name];

        if (attribIndex !== undefined) {
            gl.vertexAttribPointer(
                attribIndex,
                member.components,
                gl[AttributeType[member.type]],
                false,
                this.itemSize,
                member.offset
            );
        }
    }
};
VertexBuffer.prototype.destroy = function () {
    var gl = this.gl;
    this.buffer && (gl.deleteBuffer(this.buffer), delete this.buffer);
};

export default VertexBuffer;
