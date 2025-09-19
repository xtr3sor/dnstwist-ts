// Custom dictionary usage examples
const {
    generateDomainVariations,
    createCustomDictionary,
    loadDictionaryFromFile,
    loadDictionaryFromUrl,
    Dictionary
} = require('dnstwist-ts');

console.log('=== Custom Dictionary Examples ===');

// Example 1: Create a simple custom dictionary
console.log('\n1. Simple Custom Dictionary:');
const simpleWords = ['admin', 'secure', 'login', 'portal', 'dashboard'];
const simpleDict = createCustomDictionary(simpleWords);

const variations1 = generateDomainVariations('example.com', {
    includeDictionary: true,
    customDictionary: simpleDict
});

console.log(`Generated ${variations1.length} variations with simple custom dictionary`);
console.log('Sample variations:', variations1.slice(0, 10));

// Example 2: Create a categorized custom dictionary
console.log('\n2. Categorized Custom Dictionary:');
const categorizedDict = createCustomDictionary(
    ['admin', 'secure', 'login'], // custom words
    {
        banking: ['bank', 'finance', 'money', 'account', 'payment'],
        crypto: ['bitcoin', 'ethereum', 'wallet', 'trading', 'exchange'],
        social: ['profile', 'friend', 'message', 'chat', 'post']
    }
);

const variations2 = generateDomainVariations('paypal.com', {
    includeDictionary: true,
    customDictionary: categorizedDict
});

console.log(`Generated ${variations2.length} variations with categorized dictionary`);
console.log('Sample variations:', variations2.slice(0, 10));

// Example 3: Banking-specific dictionary
console.log('\n3. Banking-Specific Dictionary:');
const bankingDict = {
    words: ['secure', 'login', 'account', 'banking', 'online'],
    banking: ['payment', 'transfer', 'deposit', 'withdraw', 'balance', 'statement'],
    security: ['verify', 'authenticate', 'confirm', 'validate', 'protect']
};

const variations3 = generateDomainVariations('chase.com', {
    includeDictionary: true,
    customDictionary: bankingDict
});

console.log(`Generated ${variations3.length} variations with banking dictionary`);
console.log('Sample variations:', variations3.slice(0, 10));

// Example 4: E-commerce specific dictionary
console.log('\n4. E-commerce Dictionary:');
const ecommerceDict = {
    words: ['shop', 'store', 'buy', 'sell', 'cart'],
    ecommerce: ['checkout', 'order', 'shipping', 'delivery', 'return', 'refund'],
    brands: ['premium', 'luxury', 'discount', 'sale', 'deal']
};

const variations4 = generateDomainVariations('amazon.com', {
    includeDictionary: true,
    customDictionary: ecommerceDict
});

console.log(`Generated ${variations4.length} variations with e-commerce dictionary`);
console.log('Sample variations:', variations4.slice(0, 10));

// Example 5: Social media specific dictionary
console.log('\n5. Social Media Dictionary:');
const socialDict = {
    words: ['social', 'connect', 'share', 'follow'],
    social: ['profile', 'friend', 'message', 'chat', 'post', 'story', 'reel'],
    privacy: ['private', 'public', 'block', 'report', 'mute']
};

const variations5 = generateDomainVariations('facebook.com', {
    includeDictionary: true,
    customDictionary: socialDict
});

console.log(`Generated ${variations5.length} variations with social media dictionary`);
console.log('Sample variations:', variations5.slice(0, 10));

// Example 6: Technology-specific dictionary
console.log('\n6. Technology-Specific Dictionary:');
const techDict = {
    words: ['tech', 'digital', 'online', 'web', 'internet'],
    technology: [
        'ai', 'machine', 'learning', 'cloud', 'api', 'software', 'hardware',
        'mobile', 'desktop', 'server', 'database', 'network', 'security'
    ],
    security: ['secure', 'safe', 'private', 'encrypted', 'protected'],
    development: ['dev', 'build', 'deploy', 'test', 'debug', 'code']
};

const variations6 = generateDomainVariations('github.com', {
    includeDictionary: true,
    customDictionary: techDict
});

console.log(`Generated ${variations6.length} variations with technology dictionary`);
console.log('Sample variations:', variations6.slice(0, 10));

// Example 7: Combining custom dictionary with other engines
console.log('\n7. Custom Dictionary + Other Engines:');
const combinedVariations = generateDomainVariations('google.com', {
    includeVowelSwap: true,
    includeGlyphs: true,
    includeDictionary: true,
    includeTldFusion: true,
    customDictionary: {
        custom: ['search', 'browser', 'chrome', 'android', 'youtube'],
        tech: ['ai', 'machine', 'learning', 'cloud', 'api']
    }
});

console.log(`Generated ${combinedVariations.length} total variations with combined engines`);
console.log('Sample variations:', combinedVariations.slice(0, 15));

// Example 8: Performance comparison
console.log('\n8. Performance Comparison:');
console.time('Built-in Dictionary');
const builtinVariations = generateDomainVariations('test.com', {
    includeDictionary: true
});
console.timeEnd('Built-in Dictionary');
console.log(`Built-in dictionary: ${builtinVariations.length} variations`);

console.time('Custom Dictionary');
const customVariations = generateDomainVariations('test.com', {
    includeDictionary: true,
    customDictionary: { custom: ['admin', 'secure', 'login'] }
});
console.timeEnd('Custom Dictionary');
console.log(`Custom dictionary: ${customVariations.length} variations`);

// Example 9: Dictionary statistics
console.log('\n9. Dictionary Statistics:');
function analyzeDictionary(dict, name) {
    const totalWords = Object.values(dict).reduce((sum, words) => sum + (words ? words.length : 0), 0);
    const categories = Object.keys(dict).length;
    console.log(`${name}: ${totalWords} words across ${categories} categories`);
}

analyzeDictionary(bankingDict, 'Banking Dictionary');
analyzeDictionary(ecommerceDict, 'E-commerce Dictionary');
analyzeDictionary(socialDict, 'Social Media Dictionary');
analyzeDictionary(cryptoDict, 'Crypto Dictionary');

console.log('\n=== Dictionary Loading Examples ===');
console.log('Note: The following examples show how to load dictionaries from external sources.');
console.log('Uncomment and modify the file paths/URLs to test with your own dictionaries.');

// Example 10: Loading dictionary from file (commented out - requires actual file)
/*
console.log('\n10. Loading Dictionary from File:');
try {
    const fileDict = await loadDictionaryFromFile('./my-dictionary.json');
    const fileVariations = generateDomainVariations('example.com', {
        includeDictionary: true,
        customDictionary: fileDict
    });
    console.log(`Loaded dictionary from file: ${fileVariations.length} variations`);
} catch (error) {
    console.log('File loading example (commented out):', error.message);
}
*/

// Example 11: Loading dictionary from URL (commented out - requires actual URL)
/*
console.log('\n11. Loading Dictionary from URL:');
try {
    const urlDict = await loadDictionaryFromUrl('https://example.com/dictionary.json');
    const urlVariations = generateDomainVariations('example.com', {
        includeDictionary: true,
        customDictionary: urlDict
    });
    console.log(`Loaded dictionary from URL: ${urlVariations.length} variations`);
} catch (error) {
    console.log('URL loading example (commented out):', error.message);
}
*/

console.log('\n=== Summary ===');
console.log('Custom dictionaries allow you to:');
console.log('- Use domain-specific word lists');
console.log('- Create categorized dictionaries');
console.log('- Load dictionaries from external sources');
console.log('- Reduce the number of variations for faster processing');
console.log('- Focus on specific threat vectors');
