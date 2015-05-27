/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />

module ColourWrapper {
    export function randomTermGenerator(seed: number): number {

        var random = Math.sin(seed) * 1000000;
        random = random - Math.floor(random);

        return random;
    }

    export function hslFromSeed(seed: number, colourModel: ColourModel.ColourModel) {
        colourModel = colourModel || new ColourModel.ColourModel();
        var randomTerm = randomTermGenerator(seed);
        return new HSL.HSL(
            colourModel.hue(randomTerm),
            colourModel.saturation(randomTermGenerator(randomTerm)),
            colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm)))
            )
    }
}