import { transformSaaSInputToGeneratorData } from '../lib/presspilot/dataTransformer';
import { buildSaaSInputFromStudioInput } from '../lib/presspilot/studioAdapter';

const input = {
    businessName: "Pizza Prego",
    businessDescription: "Italian Pizza House",
    heroTitle: "Pizza Prego", // This is what our fix should ensure
    paletteId: "pp-slate",
    fontPairId: "pp-inter"
};

const saasInput = buildSaaSInputFromStudioInput(input);
const generatorData = transformSaaSInputToGeneratorData(saasInput);

console.log('Business Name:', generatorData.name);
console.log('Hero Headline:', generatorData.hero_headline);

if (generatorData.name === "Pizza Prego" && generatorData.hero_headline === "Pizza Prego") {
    console.log('FIX 1 VERIFIED: Business name and Hero headline are correct.');
} else {
    console.error('FIX 1 FAILED:', generatorData);
    process.exit(1);
}
