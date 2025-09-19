# dnstwist-ts

A TypeScript port of [DNSTwist](https://github.com/elceef/dnstwist) - Domain name permutation engine for detecting typo squatting, phishing and corporate espionage.

## Overview

dnstwist-ts is a TypeScript/JavaScript library that generates domain name variations to help detect potential typosquatting, phishing attacks, and brand impersonation. It's a direct port of the popular Python tool [dnstwist](https://github.com/elceef/dnstwist) by [@elceef](https://github.com/elceef).

## Features

- **Multiple permutation engines**: Vowel swapping, character substitution, Unicode homoglyphs, and more
- **Dictionary-based variations**: Uses word lists for common terms and domain-specific keywords
- **Custom dictionary support**: Create your own dictionaries or load from external sources
- **Unicode support**: Handles internationalized domain names (IDN) with built-in punycode conversion
- **TypeScript support**: Full type definitions included
- **Modular design**: Use individual engines or combine them as needed
- **Minimal dependencies**: Only requires `tldts` and `tlds` packages (includes custom punycode implementation)

## Installation

```bash
npm install dnstwist-ts
```

## Usage

### Basic Usage

```typescript
import { generateDomainVariations } from "dnstwist-ts";

// Generate all possible variations
const variations = generateDomainVariations("example.com");
console.log(variations);
// Output: ['ex4mple.com', 'ex4mpl3.com', 'exampl3.com', ...]
```

### Advanced Usage with Options

```typescript
import { generateDomainVariations } from "dnstwist-ts";

// Generate variations with specific engines only
const variations = generateDomainVariations("example.com", {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeUnicode: false,
  includeDictionary: true,
  // ... other options
});
```

### Using Individual Engines

```typescript
import {
  engineVowelswap,
  engineGlyphs,
  engineUnicode,
  engineDictionary,
} from "dnstwist-ts";

const domain = "example";
const vowelVariations = engineVowelswap(domain);
const glyphVariations = engineGlyphs(domain);
const unicodeVariations = engineUnicode(domain);
const dictVariations = engineDictionary(domain, "com");
```

### Simple Twist Function

```typescript
import { twistDomain } from "dnstwist-ts";

// Quick domain variations
const variations = twistDomain("google.com");
console.log(variations);
```

## Available Engines

- **Vowel Swap**: Swaps vowels (a, e, i, o, u) in domain names
- **Glyphs**: Character substitution using visually similar characters
- **Unicode**: Unicode homoglyph substitution with punycode conversion
- **Omission**: Removes individual characters
- **Duplication**: Duplicates individual characters
- **Addition**: Adds characters at various positions
- **Replacement**: Replaces characters with alphanumeric alternatives
- **Bitsquatting**: Bit-level character variations
- **Hyphenation**: Adds hyphens at various positions
- **Subdomain**: Creates subdomain variations
- **Position Swap**: Swaps character positions
- **Dictionary**: Uses word lists for domain variations
- **Number to Letter**: Converts numbers to similar-looking letters
- **Homoglyphs**: Unicode character substitutions
- **Common Misspellings**: Common typing mistakes
- **TLD Fusion**: Different top-level domain variations
- **Keyboard Shift**: Adjacent keyboard key substitutions
- **Letter Repetition**: Common letter repetition patterns
- **Letter Swap**: Common letter pair swaps
- **Common Typo**: Common typing error patterns

## API Reference

### `generateDomainVariations(domain: string, options?: Options): string[]`

Generates domain variations using specified engines.

**Parameters:**

- `domain`: The domain name to generate variations for
- `options`: Optional configuration object

**Options:**

```typescript
interface Options {
  includeVowelSwap?: boolean;
  includeGlyphs?: boolean;
  includeUnicode?: boolean;
  includeOmission?: boolean;
  includeDuplication?: boolean;
  includeAddition?: boolean;
  includeReplacement?: boolean;
  includeBitsquatting?: boolean;
  includeHyphenation?: boolean;
  includeSubdomain?: boolean;
  includePositionSwap?: boolean;
  includeDictionary?: boolean;
  includeNumberToLetter?: boolean;
  includeHomoglyphs?: boolean;
  includeCommonMisspellings?: boolean;
  includeTldFusion?: boolean;
  includeKeyboardShift?: boolean;
  includeLetterRepetition?: boolean;
  includeLetterSwap?: boolean;
  includeCommonTypo?: boolean;
}
```

### `twistDomain(domain: string): string[]`

Simple function that generates basic domain variations.

### Individual Engine Functions

All engines are available as individual functions:

- `engineVowelswap(domain: string): string[]`
- `engineGlyphs(domain: string): string[]`
- `engineUnicode(domain: string): string[]`
- `engineOmission(domain: string): string[]`
- `engineDuplication(domain: string): string[]`
- `engineAddition(domain: string): string[]`
- `engineReplacement(domain: string): string[]`
- `engineBitsquatting(domain: string): string[]`
- `engineHyphenation(domain: string): string[]`
- `engineSubdomain(domain: string): string[]`
- `enginePositionswap(domain: string): string[]`
- `engineDictionary(baseDomain: string, tld: string): string[]`
- `engineNumberToLetter(domain: string): string[]`
- `engineHomoglyphs(domain: string): string[]`
- `engineCommonMisspellings(domain: string): string[]`
- `engineTldFusion(domain: string, originalTld: string): string[]`
- `engineKeyboardShift(domain: string): string[]`
- `engineLetterRepetition(domain: string): string[]`
- `engineLetterSwap(domain: string): string[]`
- `engineCommonTypo(domain: string): string[]`

## Examples

### Basic Domain Variations

```typescript
import { generateDomainVariations, twistDomain } from "dnstwist-ts";

// Simple domain variations
const variations = twistDomain("google.com");
console.log(variations);
// Output: ['g00gle.com', 'g0ogle.com', 'go0gle.com', 'googl3.com', ...]

// More comprehensive variations
const allVariations = generateDomainVariations("example.com");
console.log(`Generated ${allVariations.length} variations`);
```

### Detecting Potential Phishing Domains

```typescript
import { generateDomainVariations } from "dnstwist-ts";

const targetDomain = "paypal.com";
const variations = generateDomainVariations(targetDomain, {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeUnicode: true,
  includeDictionary: true,
});

console.log("Potential phishing domains:");
variations.slice(0, 10).forEach((variation) => {
  console.log(variation);
});
// Output:
// payp4l.com
// payp4l.com
// p4ypal.com
// paypal.com
// payp4l.com
// ...
```

### Brand Protection with Specific Engines

```typescript
import { generateDomainVariations } from "dnstwist-ts";

const brandDomain = "microsoft.com";
const variations = generateDomainVariations(brandDomain, {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeDictionary: true,
  includeTldFusion: true,
  includeUnicode: false, // Skip Unicode for faster processing
  includeBitsquatting: false, // Skip bitsquatting for faster processing
});

console.log(`Generated ${variations.length} potential brand variations`);
// Monitor these variations for potential brand abuse
```

### Using Individual Engines

```typescript
import {
  engineVowelswap,
  engineGlyphs,
  engineUnicode,
  engineDictionary,
  engineHyphenation,
  engineTldFusion,
} from "dnstwist-ts";

const domain = "facebook";
const tld = "com";

// Vowel swapping
const vowelVariations = engineVowelswap(domain);
console.log("Vowel variations:", vowelVariations);
// Output: ['f4cebook', 'f4c3book', 'f4c3b00k', ...]

// Character glyph substitutions
const glyphVariations = engineGlyphs(domain);
console.log("Glyph variations:", glyphVariations.slice(0, 5));
// Output: ['f4cebook', 'f4c3book', 'f4c3b00k', ...]

// Unicode homoglyphs (with punycode conversion)
const unicodeVariations = engineUnicode(domain);
console.log("Unicode variations:", unicodeVariations.slice(0, 5));

// Dictionary-based variations
const dictVariations = engineDictionary(domain, tld);
console.log("Dictionary variations:", dictVariations.slice(0, 5));
// Output: ['wwwfacebook', 'facebookwww', 'www-facebook', ...]

// Hyphenation
const hyphenVariations = engineHyphenation(domain);
console.log("Hyphen variations:", hyphenVariations.slice(0, 5));
// Output: ['f-acebook', 'fa-cebook', 'fac-ebook', ...]

// TLD variations
const tldVariations = engineTldFusion(domain, tld);
console.log("TLD variations:", tldVariations.slice(0, 5));
// Output: ['facebook.net', 'facebook.org', 'facebook.io', ...]
```


### Banking Domain Protection

```typescript
import { generateDomainVariations } from "dnstwist-ts";

const bankDomain = "chase.com";
const variations = generateDomainVariations(bankDomain, {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeUnicode: true,
  includeDictionary: true,
  includeHyphenation: true,
  includeTldFusion: true,
});

// Focus on variations that could be used for phishing
const phishingCandidates = variations.filter((variation) => {
  // Look for variations that are very similar to original
  const similarity = calculateSimilarity(bankDomain, variation);
  return similarity > 0.8;
});

console.log(`Found ${phishingCandidates.length} high-similarity variations`);
```

### E-commerce Domain Monitoring

```typescript
import { generateDomainVariations } from "dnstwist-ts";

const ecommerceDomain = "amazon.com";
const variations = generateDomainVariations(ecommerceDomain, {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeDictionary: true,
  includeTldFusion: true,
});

// Check for variations that might confuse customers
const confusingVariations = variations.filter((variation) => {
  // Look for variations that could be easily mistyped
  return variation.length <= ecommerceDomain.length + 2;
});

console.log(
  "Potentially confusing variations:",
  confusingVariations.slice(0, 10)
);
```

### Social Media Domain Protection

```typescript
import { generateDomainVariations } from "dnstwist-ts";

const socialDomain = "twitter.com";
const variations = generateDomainVariations(socialDomain, {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeUnicode: true,
  includeDictionary: true,
});

// Look for variations that could be used for fake accounts
const fakeAccountDomains = variations.filter(
  (variation) => variation.includes("twitter") && variation !== socialDomain
);

console.log("Potential fake account domains:", fakeAccountDomains.slice(0, 10));
```

### Performance Optimization

```typescript
import { generateDomainVariations } from "dnstwist-ts";

// For large-scale monitoring, use only essential engines
const fastVariations = generateDomainVariations("example.com", {
  includeVowelSwap: true,
  includeGlyphs: true,
  includeDictionary: false, // Skip dictionary for speed
  includeUnicode: false, // Skip Unicode for speed
  includeBitsquatting: false, // Skip bitsquatting for speed
  includeTldFusion: true, // Keep TLD fusion as it's fast
});

console.log(`Fast generation: ${fastVariations.length} variations`);
```

### Custom Domain Analysis

```typescript
import {
  generateDomainVariations,
  engineVowelswap,
  engineGlyphs,
  removeDuplicates,
} from "dnstwist-ts";

function analyzeDomain(domain: string) {
  // Generate variations using different engines
  const vowelVariations = engineVowelswap(domain);
  const glyphVariations = engineGlyphs(domain);

  // Combine and deduplicate
  const allVariations = removeDuplicates([
    ...vowelVariations,
    ...glyphVariations,
  ]);

  // Analyze the results
  const analysis = {
    original: domain,
    totalVariations: allVariations.length,
    vowelVariations: vowelVariations.length,
    glyphVariations: glyphVariations.length,
    variations: allVariations,
  };

  return analysis;
}

const result = analyzeDomain("github.com");
console.log(`Analysis for ${result.original}:`);
console.log(`Total variations: ${result.totalVariations}`);
console.log(`Sample variations:`, result.variations.slice(0, 5));
```

### Custom Dictionary Support

```typescript
import {
  generateDomainVariations,
  createCustomDictionary,
  loadDictionaryFromFile,
  loadDictionaryFromUrl,
  Dictionary,
} from "dnstwist-ts";

// Create a simple custom dictionary
const simpleDict = createCustomDictionary(["admin", "secure", "login"]);

const variations = generateDomainVariations("example.com", {
  includeDictionary: true,
  customDictionary: simpleDict,
});

// Create a categorized dictionary
const bankingDict = createCustomDictionary(
  ["admin", "secure"], // custom words
  {
    banking: ["bank", "finance", "money", "account"],
    security: ["verify", "authenticate", "confirm", "validate"],
  }
);

// Use categorized dictionary
const bankingVariations = generateDomainVariations("chase.com", {
  includeDictionary: true,
  customDictionary: bankingDict,
});

// Load dictionary from file
const fileDict = await loadDictionaryFromFile("./my-dictionary.json");

// Load dictionary from URL
const urlDict = await loadDictionaryFromUrl(
  "https://example.com/dictionary.json"
);
```

### Integration with DNS Checking

```typescript
import { generateDomainVariations } from "dnstwist-ts";

async function checkDomainVariations(domain: string) {
  const variations = generateDomainVariations(domain);
  const results = [];

  for (const variation of variations.slice(0, 10)) {
    // Limit for demo
    try {
      // In a real implementation, you would use a DNS library
      // const dns = require('dns');
      // const addresses = await dns.promises.resolve4(variation);

      // For demo purposes, we'll simulate
      const isRegistered = Math.random() > 0.8; // 20% chance of being registered

      results.push({
        domain: variation,
        registered: isRegistered,
        // addresses: addresses // In real implementation
      });
    } catch (error) {
      results.push({
        domain: variation,
        registered: false,
        error: error.message,
      });
    }
  }

  return results;
}

// Usage
checkDomainVariations("google.com").then((results) => {
  const registeredDomains = results.filter((r) => r.registered);
  console.log(
    `Found ${registeredDomains.length} registered variations:`,
    registeredDomains
  );
});
```

## Examples Directory

This package includes comprehensive examples in the `examples/` directory:

- **`basic-usage.js`** - Basic usage examples and simple domain variations
- **`individual-engines.js`** - Examples of using each individual engine
- **`advanced-usage.js`** - Advanced usage patterns and custom analysis
- **`dns-integration.js`** - DNS integration examples (simulated and real)
- **`custom-dictionary.js`** - Custom dictionary creation and usage examples

To run the examples:

```bash
cd examples
npm install
npm run basic      # Run basic examples
npm run engines    # Run individual engine examples
npm run advanced   # Run advanced examples
npm run dns        # Run DNS integration examples
npm run dictionary # Run custom dictionary examples
npm run all        # Run all examples
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

This project is a TypeScript port of the excellent [dnstwist](https://github.com/elceef/dnstwist) tool by [@elceef](https://github.com/elceef). Visit the original project for the Python implementation.

## Security Notice

This tool is designed for legitimate security research, brand protection, and threat intelligence purposes. Please use responsibly and in accordance with applicable laws and regulations.
