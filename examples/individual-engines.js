// Individual engine usage examples
const { 
    engineVowelswap, 
    engineGlyphs, 
    engineUnicode,
    engineDictionary,
    engineHyphenation,
    engineTldFusion,
    engineOmission,
    engineDuplication,
    engineAddition,
    engineReplacement,
    engineBitsquatting,
    engineSubdomain,
    enginePositionswap,
    engineNumberToLetter,
    engineHomoglyphs,
    engineCommonMisspellings,
    engineKeyboardShift,
    engineLetterRepetition,
    engineLetterSwap,
    engineCommonTypo
} = require('dnstwist-ts');

const domain = 'facebook';
const tld = 'com';

console.log('=== Individual Engine Examples ===');
console.log(`Testing domain: ${domain}`);
console.log('');

// Vowel swapping
console.log('1. Vowel Swapping:');
const vowelVariations = engineVowelswap(domain);
console.log('Vowel variations:', vowelVariations.slice(0, 5));
console.log('');

// Character glyph substitutions
console.log('2. Character Glyph Substitutions:');
const glyphVariations = engineGlyphs(domain);
console.log('Glyph variations:', glyphVariations.slice(0, 5));
console.log('');

// Unicode homoglyphs (with punycode conversion)
console.log('3. Unicode Homoglyphs:');
const unicodeVariations = engineUnicode(domain);
console.log('Unicode variations:', unicodeVariations.slice(0, 5));
console.log('');

// Dictionary-based variations
console.log('4. Dictionary-based Variations:');
const dictVariations = engineDictionary(domain, tld);
console.log('Dictionary variations:', dictVariations.slice(0, 5));
console.log('');

// Hyphenation
console.log('5. Hyphenation:');
const hyphenVariations = engineHyphenation(domain);
console.log('Hyphen variations:', hyphenVariations.slice(0, 5));
console.log('');

// TLD variations
console.log('6. TLD Variations:');
const tldVariations = engineTldFusion(domain, tld);
console.log('TLD variations:', tldVariations.slice(0, 5));
console.log('');

// Character omission
console.log('7. Character Omission:');
const omissionVariations = engineOmission(domain);
console.log('Omission variations:', omissionVariations);
console.log('');

// Character duplication
console.log('8. Character Duplication:');
const duplicationVariations = engineDuplication(domain);
console.log('Duplication variations:', duplicationVariations.slice(0, 5));
console.log('');

// Character addition
console.log('9. Character Addition:');
const additionVariations = engineAddition(domain);
console.log('Addition variations (first 5):', additionVariations.slice(0, 5));
console.log(`Total addition variations: ${additionVariations.length}`);
console.log('');

// Character replacement
console.log('10. Character Replacement:');
const replacementVariations = engineReplacement(domain);
console.log('Replacement variations (first 5):', replacementVariations.slice(0, 5));
console.log(`Total replacement variations: ${replacementVariations.length}`);
console.log('');

// Bitsquatting
console.log('11. Bitsquatting:');
const bitsquattingVariations = engineBitsquatting(domain);
console.log('Bitsquatting variations:', bitsquattingVariations.slice(0, 5));
console.log('');

// Subdomain generation
console.log('12. Subdomain Generation:');
const subdomainVariations = engineSubdomain(domain);
console.log('Subdomain variations:', subdomainVariations.slice(0, 5));
console.log('');

// Position swapping
console.log('13. Position Swapping:');
const positionVariations = enginePositionswap(domain);
console.log('Position variations (first 5):', positionVariations.slice(0, 5));
console.log(`Total position variations: ${positionVariations.length}`);
console.log('');

// Number to letter conversion
console.log('14. Number to Letter Conversion:');
const numberVariations = engineNumberToLetter('test123');
console.log('Number variations:', numberVariations);
console.log('');

// Homoglyphs
console.log('15. Homoglyphs:');
const homoglyphVariations = engineHomoglyphs(domain);
console.log('Homoglyph variations:', homoglyphVariations.slice(0, 5));
console.log('');

// Common misspellings
console.log('16. Common Misspellings:');
const misspellingVariations = engineCommonMisspellings('receive');
console.log('Misspelling variations:', misspellingVariations);
console.log('');

// Keyboard shift
console.log('17. Keyboard Shift:');
const keyboardVariations = engineKeyboardShift(domain);
console.log('Keyboard variations:', keyboardVariations.slice(0, 5));
console.log('');

// Letter repetition
console.log('18. Letter Repetition:');
const repetitionVariations = engineLetterRepetition(domain);
console.log('Repetition variations:', repetitionVariations.slice(0, 5));
console.log('');

// Letter swap
console.log('19. Letter Swap:');
const swapVariations = engineLetterSwap('receive');
console.log('Swap variations:', swapVariations);
console.log('');

// Common typos
console.log('20. Common Typos:');
const typoVariations = engineCommonTypo('information');
console.log('Typo variations:', typoVariations.slice(0, 5));
console.log('');
