import HSL = require('./HSL')
import ColourModel = require('./ColourModel')

/**
 * Deterministic random number generator, not guaranteed to be a good RNG
 * @param  {number} seed initial seed
 * @return {number}      random number based off of initial seed, will always correspond to the same seed
 */
export function randomTermGenerator(seed: number): number {

    var random = Math.sin(seed) * 1000000;
    random = random - Math.floor(random);

    return random;
}

/**
 * Returns an HSL instance from a random number seed, takes an optional colour model for the HSL instance
 * @param {number}                  seed        
 * @param {ColourModel.ColourModel} colourModel 
 */
export function hslFromSeed(seed: number, colourModel ?: ColourModel.ColourModel) {
    colourModel = colourModel || new ColourModel.ColourModel();
    var randomTerm = randomTermGenerator(seed);
    return new HSL.HSL(
        colourModel.hue(randomTerm),
        colourModel.saturation(randomTermGenerator(randomTerm)),
        colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm)))
        )
}
