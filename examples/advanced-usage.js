// Advanced usage examples for dnstwist-ts
const { 
    generateDomainVariations,
    engineVowelswap,
    engineGlyphs,
    removeDuplicates
} = require('dnstwist-ts');

console.log('=== Advanced Usage Examples ===');

// Custom domain analysis function
function analyzeDomain(domain) {
    console.log(`\nAnalyzing domain: ${domain}`);
    
    // Generate variations using different engines
    const vowelVariations = engineVowelswap(domain);
    const glyphVariations = engineGlyphs(domain);
    
    // Combine and deduplicate
    const allVariations = removeDuplicates([
        ...vowelVariations,
        ...glyphVariations
    ]);
    
    // Analyze the results
    const analysis = {
        original: domain,
        totalVariations: allVariations.length,
        vowelVariations: vowelVariations.length,
        glyphVariations: glyphVariations.length,
        variations: allVariations
    };
    
    return analysis;
}

// Test with different domains
const domains = ['github.com', 'google.com', 'facebook.com'];

domains.forEach(domain => {
    const result = analyzeDomain(domain);
    console.log(`\nAnalysis for ${result.original}:`);
    console.log(`Total variations: ${result.totalVariations}`);
    console.log(`Vowel variations: ${result.vowelVariations}`);
    console.log(`Glyph variations: ${result.glyphVariations}`);
    console.log(`Sample variations:`, result.variations.slice(0, 5));
});

// Performance optimization example
console.log('\n=== Performance Optimization ===');

function generateFastVariations(domain) {
    return generateDomainVariations(domain, {
        includeVowelSwap: true,
        includeGlyphs: true,
        includeDictionary: false, // Skip dictionary for speed
        includeUnicode: false,    // Skip Unicode for speed
        includeBitsquatting: false, // Skip bitsquatting for speed
        includeTldFusion: true    // Keep TLD fusion as it's fast
    });
}

const fastVariations = generateFastVariations('example.com');
console.log(`Fast generation for example.com: ${fastVariations.length} variations`);

// Crypto domain monitoring
console.log('\n=== Crypto Domain Monitoring ===');

const cryptoDomain = 'binance.com';
const cryptoVariations = generateDomainVariations(cryptoDomain, {
    includeDictionary: true, // Uses crypto-related words
    includeVowelSwap: true,
    includeGlyphs: true,
    includeTldFusion: true
});

// Filter for high-risk variations
const highRiskVariations = cryptoVariations.filter(variation => 
    variation.includes('bitcoin') || 
    variation.includes('crypto') || 
    variation.includes('wallet')
);

console.log(`Generated ${cryptoVariations.length} variations for ${cryptoDomain}`);
console.log(`Found ${highRiskVariations.length} high-risk crypto variations`);
console.log('High-risk variations:', highRiskVariations.slice(0, 5));

// Banking domain protection
console.log('\n=== Banking Domain Protection ===');

const bankDomain = 'chase.com';
const bankVariations = generateDomainVariations(bankDomain, {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeUnicode: true,
    includeDictionary: true,
    includeHyphenation: true,
    includeTldFusion: true
});

// Simple similarity check (in real implementation, use proper similarity algorithm)
function calculateSimpleSimilarity(original, variation) {
    const originalClean = original.replace('.com', '');
    const variationClean = variation.replace('.com', '');
    
    if (originalClean === variationClean) return 1.0;
    
    let matches = 0;
    const minLength = Math.min(originalClean.length, variationClean.length);
    
    for (let i = 0; i < minLength; i++) {
        if (originalClean[i] === variationClean[i]) {
            matches++;
        }
    }
    
    return matches / Math.max(originalClean.length, variationClean.length);
}

// Focus on variations that could be used for phishing
const phishingCandidates = bankVariations.filter(variation => {
    const similarity = calculateSimpleSimilarity(bankDomain, variation);
    return similarity > 0.7;
});

console.log(`Generated ${bankVariations.length} variations for ${bankDomain}`);
console.log(`Found ${phishingCandidates.length} high-similarity variations`);
console.log('High-similarity variations:', phishingCandidates.slice(0, 10));

// E-commerce domain monitoring
console.log('\n=== E-commerce Domain Monitoring ===');

const ecommerceDomain = 'amazon.com';
const ecommerceVariations = generateDomainVariations(ecommerceDomain, {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeDictionary: true,
    includeTldFusion: true
});

// Check for variations that might confuse customers
const confusingVariations = ecommerceVariations.filter(variation => {
    // Look for variations that could be easily mistyped
    return variation.length <= ecommerceDomain.length + 2;
});

console.log(`Generated ${ecommerceVariations.length} variations for ${ecommerceDomain}`);
console.log(`Found ${confusingVariations.length} potentially confusing variations`);
console.log('Confusing variations:', confusingVariations.slice(0, 10));

// Social media domain protection
console.log('\n=== Social Media Domain Protection ===');

const socialDomain = 'twitter.com';
const socialVariations = generateDomainVariations(socialDomain, {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeUnicode: true,
    includeDictionary: true
});

// Look for variations that could be used for fake accounts
const fakeAccountDomains = socialVariations.filter(variation => 
    variation.includes('twitter') && 
    variation !== socialDomain
);

console.log(`Generated ${socialVariations.length} variations for ${socialDomain}`);
console.log(`Found ${fakeAccountDomains.length} potential fake account domains`);
console.log('Fake account domains:', fakeAccountDomains.slice(0, 10));

// Batch processing example
console.log('\n=== Batch Processing Example ===');

const domainsToCheck = ['google.com', 'facebook.com', 'amazon.com', 'microsoft.com'];

domainsToCheck.forEach(domain => {
    const variations = generateDomainVariations(domain, {
        includeVowelSwap: true,
        includeGlyphs: true,
        includeTldFusion: true
    });
    
    console.log(`${domain}: ${variations.length} variations generated`);
});

// Summary statistics
console.log('\n=== Summary Statistics ===');

const totalVariations = domainsToCheck.reduce((total, domain) => {
    const variations = generateDomainVariations(domain, {
        includeVowelSwap: true,
        includeGlyphs: true,
        includeTldFusion: true
    });
    return total + variations.length;
}, 0);

console.log(`Total variations generated for ${domainsToCheck.length} domains: ${totalVariations}`);
console.log(`Average variations per domain: ${Math.round(totalVariations / domainsToCheck.length)}`);
