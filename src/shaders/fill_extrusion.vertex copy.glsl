


uniform mat4 u_matrix;
uniform vec3 u_lightcolor;
uniform lowp vec3 u_lightpos;
uniform lowp float u_lightintensity;
uniform float u_vertical_gradient;
uniform lowp float u_opacity;
uniform int u_type;

attribute vec2 a_pos;
attribute vec4 a_normal_ed;
varying vec3 v_point_y;
varying vec4 v_top_color;
varying vec4 v_bottom_color;
#pragma mapbox: define highp float base
#pragma mapbox: define highp float height
#pragma mapbox: define highp vec4 color
#pragma mapbox: define lowp float intensity
#pragma mapbox: define highp vec4 bottom_color

vec4 append_lighting(const vec4 p_color) {
   #pragma mapbox: initialize highp float base
   #pragma mapbox: initialize highp float height 
    vec3 normal = a_normal_ed.xyz;
    base = max(0.0, base);
    height = max(0.0, height);
    float t = mod(normal.x, 2.0);
    vec4 color = p_color;
    float colorvalue = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
    vec4 ambientlight = vec4(0.03, 0.03, 0.03, 0.0);
    color += ambientlight;
    float directional = clamp(dot(normal / 16384.0, u_lightpos), 0.0, 1.0);
    directional = mix((1.0 - u_lightintensity), max((1.0 - colorvalue + u_lightintensity), 1.0), directional);
    if (normal.y != 0.0) {
        directional *= ((1.0 - u_vertical_gradient) + \n(u_vertical_gradient * clamp((t + base) * pow(height / 150.0, 0.5), mix(0.7, 0.98, 1.0 - u_lightintensity), 1.0)));
    }
    vec4 r_color = vec4(0.0);
    r_color.rgb = clamp(color.rgb * directional * u_lightcolor, mix(vec3(0.0), vec3(0.3), 1.0 - u_lightcolor), vec3(1.0));
    r_color.a = color.a;
    r_color *= u_opacity;
    return r_color;
}
void main() {
    #pragma mapbox: initialize highp float base
    #pragma mapbox: initialize highp float height
    #pragma mapbox: initialize highp vec4 color

    #pragma mapbox: initialize lowp float intensity
    #pragma mapbox: initialize highp vec4 bottom_color 

    vec3 normal = a_normal_ed.xyz;
    base = max(0.0, base);
    height = max(0.0, height);
    float t = mod(normal.x, 2.0);
    gl_Position = u_matrix * vec4(a_pos, t > 0.0 ? height: base, 1);
    v_point_y = vec3(t > 0.0 ? height: base, base, height);
    v_top_color = color;
    v_bottom_color = color;
    if (u_type == 1) {
        if (intensity > 0.0) {
            v_top_color *= abs(intensity);
        }
        if (intensity < 0.0) {
            v_bottom_color *= abs(intensity);
        }
    } else if (u_type == 2) {
        v_bottom_color = bottom_color;
    }
    v_top_color = append_lighting(v_top_color);
    v_bottom_color = append_lighting(v_bottom_color);
}
