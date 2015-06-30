/**
 * Class to represent a colour based off of hue, saturation, and lightness
 */
export class HSL{
    hue: number;
    saturation: number;
    lightness: number;

    constructor(hue, saturation, lightness) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
    }

    /**
     * Returns instance as a CSS hsl colour as a string.
     * @return {string} string containing a CSS hsl colour
     */
    toCSSString(): string {
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }

    /**
     * Adds another HSL instance to this instance. Does so in a mutable manner.
     * @param  {HSL} HSLtoAdd 
     * @return {HSL}          Current HSL instance. Not a copy/clone of the instance.
     */
    add(HSLtoAdd: HSL): HSL {
        this.hue += HSLtoAdd.hue;
        this.saturation += HSLtoAdd.saturation;
        this.lightness += HSLtoAdd.lightness;

        return this;
    }

    /**
     * Divides the HSL instance by a scalar number. Does so in a mutable manner
     * @param  {number} scalar 
     * @return {HSL}           Current HSL instance. Not a copy/clone of the instance.
     */
    scalarDivide(scalar: number): HSL {
        this.hue = this.hue / scalar;
        this.saturation = this.saturation / scalar;
        this.lightness = this.lightness / scalar;

        return this;
    }

    /**
     * Multiplies the HSL instance by a scalar number. Does so in a mutable manner
     * @param  {number} scalar 
     * @return {HSL}           Current HSL instance. Not a copy/clone of the instance.
     */
    scalarMultiply(scalar: number): HSL {
        this.hue = this.hue * scalar;
        this.saturation = this.saturation * scalar;
        this.lightness = this.lightness * scalar;

        return this;
    }
}   
