// Basic usage examples for dnstwist-ts
const { generateDomainVariations, twistDomain } = require('dnstwist-ts');

console.log('=== Basic Domain Variations ===');

// Simple domain variations
const variations = twistDomain('google.com');
console.log('Simple variations for google.com:');
console.log(variations.slice(0, 10));

console.log('\n=== Comprehensive Domain Variations ===');

// More comprehensive variations
const allVariations = generateDomainVariations('example.com');
console.log(`Generated ${allVariations.length} variations for example.com`);
console.log('Sample variations:', allVariations.slice(0, 10));

console.log('\n=== Phishing Detection Example ===');

// Detecting potential phishing domains
const targetDomain = 'paypal.com';
const phishingVariations = generateDomainVariations(targetDomain, {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeUnicode: true,
    includeDictionary: true
});

console.log(`Generated ${phishingVariations.length} potential phishing variations for ${targetDomain}`);
console.log('High-risk variations:', phishingVariations.slice(0, 10));

console.log('\n=== Brand Protection Example ===');

// Brand protection with specific engines
const brandDomain = 'microsoft.com';
const brandVariations = generateDomainVariations(brandDomain, {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeDictionary: true,
    includeTldFusion: true,
    includeUnicode: false, // Skip Unicode for faster processing
    includeBitsquatting: false // Skip bitsquatting for faster processing
});

console.log(`Generated ${brandVariations.length} potential brand variations for ${brandDomain}`);
console.log('Sample brand variations:', brandVariations.slice(0, 10));
