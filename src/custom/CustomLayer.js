import CustomProgram from './CustomProgram';
import ProgramConfiguration from './ProgramConfiguration';
class CustomLayer {
    constructor(options) {
        this.id = options.id;
        this._options = options;
        this.type = "custom";
        this.renderingMode = "3d";
    }

    // method called when the layer is added to the map
    // https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
    onAdd(map, gl) {
        this.map = map;
        var programs = this._options.programs;
        programs instanceof Array || (programs = [programs]);
        this.programs = programs.map(function (program) {
            return new CustomProgram(gl, program);
        });
        this.configurations = this.programs.map(function (t) {
            return ProgramConfiguration.createProgramConfiguration(t);
        });
        delete this._options;
    }

    onRemove() {
        for (var t = 0; t < this.programs.length; t++) {
            this.programs[t].destroy();
            this.configurations[t].destroy();
        }
        delete this.map;
        delete this.matrix;
        delete this.programs;
        delete this.configurations;
    }

    // method fired on each animation frame
    // https://docs.mapbox.com/mapbox-gl-js/api/#map.event:render
    render(gl, matrix) {
        this.matrix = matrix;
        for (var r = 0; r < this.programs.length; r++) {
            var program = this.programs[r],
                config = this.configurations[r];
            program.active(),
                this.beforeRender && this.beforeRender(program, config),
                program.draw(this, config),
                this.afterRender && this.afterRender(program, config);
        }
    }
}

export default CustomLayer;
