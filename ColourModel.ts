module ColourModel {

    export function changeRange(value: number, originalRange: Array<number>, newRange: Array<number>): number {

        newRange = newRange || [0, 1];

        var baselineValue = (value - originalRange[0]) / (originalRange[1] - originalRange[0]);
        
        return (newRange[1] - newRange[0]) * baselineValue + newRange[0]; 
    }

    interface ColourModelMapping{
        hue?: (number) => number;
        saturation?: (number) => number;
        lightness?: (number) => number;
    }

    export class ColourModel implements ColourModelMapping{

        constructor(mappings ?: ColourModelMapping){
            mappings = mappings || <ColourModelMapping>{};
            if (mappings.hue) {
                this.hue = mappings.hue;
            }
            if (mappings.saturation) {
                this.saturation = mappings.saturation;
            }
            if (mappings.lightness) {
                this.lightness = mappings.lightness;
            }
        }

        hue(term: number): number {
            return changeRange(term, [0, 1], [0, 360]);
        }

        saturation(term: number): number {
            return changeRange(term, [0, 1], [0, 100]);
        }

        lightness(term: number): number {
            return changeRange(term, [0, 1], [0, 100]);
        }
    }

    export class plainColourModel extends ColourModel{
        hue(term) {
            return changeRange(term, [0, 1], [0, 360]);
        }
        saturation(term) {
            return changeRange(term, [0, 1], [35, 45]);
        }
        lightness(term) {
            return changeRange(term, [0, 1], [75, 85]);
        }
    }

    export class greyscaleColourModel extends ColourModel{
        hue(term) {
            return changeRange(term, [0, 1], [0, 0]);
        }
        saturation(term) {
            return changeRange(term, [0, 1], [0, 0]);
        }
        lightness(term) {
            return changeRange(term, [0, 1], [0, 100]);
        }
    }

    export var baseColourModels = {
        plain: new plainColourModel(),
        greyscale: new greyscaleColourModel()     
    };
}