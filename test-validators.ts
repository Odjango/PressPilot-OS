
import { BlockValidator } from './src/generator/validators/BlockValidator';
import { TokenValidator } from './src/generator/validators/TokenValidator';
import JSZip from 'jszip';
import { StructureValidator } from './src/generator/validators/StructureValidator';

async function testValidators() {
    console.log('--- Testing BlockValidator ---');
    const validHtml = '<!-- wp:group --><div class="group">Hello</div><!-- /wp:group -->';
    const invalidHtml = '<!-- wp:elementor/section --><div>Bad</div><!-- /wp:elementor/section -->';

    const r1 = BlockValidator.validate(validHtml, 'valid.html');
    if (!r1.valid) { console.error('FAIL: Valid HTML flagged as invalid'); process.exit(1); }

    const r2 = BlockValidator.validate(invalidHtml, 'invalid.html');
    if (r2.valid) { console.error('FAIL: Invalid HTML passed validation'); process.exit(1); }
    console.log('✅ BlockValidator Passed');

    console.log('--- Testing TokenValidator ---');
    const validJson = '{"color": "primary"}';
    const invalidJsonHex = '{"color": "#ffffff"}';
    const invalidJsonPx = '{"fontSize": "16px"}';

    if (!TokenValidator.validate(validJson, 'v.json').valid) { console.error('FAIL: Valid Tokens flagged'); process.exit(1); }
    if (TokenValidator.validate(invalidJsonHex, 'hex.json').valid) { console.error('FAIL: Hex passed'); process.exit(1); }
    if (TokenValidator.validate(invalidJsonPx, 'px.json').valid) { console.error('FAIL: Px passed'); process.exit(1); }
    console.log('✅ TokenValidator Passed');

    console.log('--- Testing StructureValidator ---');
    const zip = new JSZip();
    zip.file('style.css', '/* css */');
    zip.file('theme.json', '{}');
    zip.file('templates/front-page.html', '');
    zip.file('parts/header.html', '');
    zip.file('parts/footer.html', '');

    const validBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const sv1 = await StructureValidator.validate(validBuffer);
    if (!sv1.valid) { console.error('FAIL: Valid Zip flagged', sv1.error); process.exit(1); }

    const zipBad = new JSZip();
    zipBad.file('style.css', '');
    const badBuffer = await zipBad.generateAsync({ type: 'nodebuffer' });
    const sv2 = await StructureValidator.validate(badBuffer);
    if (sv2.valid) { console.error('FAIL: Invalid Zip passed'); process.exit(1); }
    console.log('✅ StructureValidator Passed');
}

testValidators().catch(e => console.error(e));
