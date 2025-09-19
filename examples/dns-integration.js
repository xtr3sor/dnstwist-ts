// DNS integration example (simulated)
const { generateDomainVariations } = require('dnstwist-ts');

console.log('=== DNS Integration Example ===');
console.log('Note: This example simulates DNS lookups. In a real implementation,');
console.log('you would use a DNS library like "dns" or "node-dns" to perform actual lookups.');
console.log('');

// Simulated DNS checking function
async function checkDomainVariations(domain, limit = 10) {
    console.log(`Checking variations for: ${domain}`);
    const variations = generateDomainVariations(domain, {
        includeVowelSwap: true,
        includeGlyphs: true,
        includeTldFusion: true
    });
    
    const results = [];
    
    for (const variation of variations.slice(0, limit)) {
        try {
            // In a real implementation, you would use:
            // const dns = require('dns');
            // const addresses = await dns.promises.resolve4(variation);
            
            // For demo purposes, we'll simulate DNS responses
            const isRegistered = Math.random() > 0.7; // 30% chance of being registered
            const responseTime = Math.random() * 100; // Random response time
            
            let addresses = [];
            if (isRegistered) {
                // Simulate some common IP addresses
                const commonIPs = [
                    '192.168.1.1',
                    '10.0.0.1',
                    '172.16.0.1',
                    '8.8.8.8',
                    '1.1.1.1'
                ];
                addresses = [commonIPs[Math.floor(Math.random() * commonIPs.length)]];
            }
            
            results.push({
                domain: variation,
                registered: isRegistered,
                addresses: addresses,
                responseTime: Math.round(responseTime),
                timestamp: new Date().toISOString()
            });
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 10));
            
        } catch (error) {
            results.push({
                domain: variation,
                registered: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    return results;
}

// Usage example
async function main() {
    try {
        const results = await checkDomainVariations('google.com', 15);
        
        const registeredDomains = results.filter(r => r.registered);
        const unregisteredDomains = results.filter(r => !r.registered);
        
        console.log(`\nResults for google.com:`);
        console.log(`Total variations checked: ${results.length}`);
        console.log(`Registered domains: ${registeredDomains.length}`);
        console.log(`Unregistered domains: ${unregisteredDomains.length}`);
        
        if (registeredDomains.length > 0) {
            console.log('\n⚠️  Registered variations (potential threats):');
            registeredDomains.forEach(result => {
                console.log(`  ${result.domain} -> ${result.addresses.join(', ')} (${result.responseTime}ms)`);
            });
        }
        
        if (unregisteredDomains.length > 0) {
            console.log('\n✅ Unregistered variations (safe):');
            unregisteredDomains.slice(0, 5).forEach(result => {
                console.log(`  ${result.domain}`);
            });
            if (unregisteredDomains.length > 5) {
                console.log(`  ... and ${unregisteredDomains.length - 5} more`);
            }
        }
        
        // Calculate statistics
        const avgResponseTime = results
            .filter(r => r.responseTime)
            .reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        
        console.log(`\nAverage response time: ${Math.round(avgResponseTime)}ms`);
        
    } catch (error) {
        console.error('Error during DNS checking:', error);
    }
}

// Run the example
main();

// Additional utility functions for real DNS integration
console.log('\n=== Real DNS Integration Code ===');
console.log('Here\'s how you would integrate with real DNS lookups:');
console.log(`
const dns = require('dns');

async function realDnsLookup(domain) {
    try {
        const addresses = await dns.promises.resolve4(domain);
        return {
            domain,
            registered: true,
            addresses: addresses,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        if (error.code === 'ENOTFOUND') {
            return {
                domain,
                registered: false,
                error: 'Domain not found',
                timestamp: new Date().toISOString()
            };
        }
        throw error;
    }
}

// Usage with dnstwist-ts
async function checkDomainWithRealDns(domain) {
    const variations = generateDomainVariations(domain);
    const results = [];
    
    for (const variation of variations.slice(0, 10)) {
        const result = await realDnsLookup(variation);
        results.push(result);
        
        // Add delay to avoid overwhelming DNS servers
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}
`);

// Batch processing with rate limiting
console.log('\n=== Batch Processing with Rate Limiting ===');

async function batchCheckDomains(domains, delayMs = 100) {
    const allResults = [];
    
    for (const domain of domains) {
        console.log(`Processing ${domain}...`);
        const results = await checkDomainVariations(domain, 5);
        allResults.push(...results);
        
        // Rate limiting
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
    return allResults;
}

// Example batch processing
const domainsToCheck = ['paypal.com', 'amazon.com', 'facebook.com'];

batchCheckDomains(domainsToCheck, 50).then(results => {
    const registeredCount = results.filter(r => r.registered).length;
    console.log(`\nBatch processing complete:`);
    console.log(`Total variations checked: ${results.length}`);
    console.log(`Registered variations found: ${registeredCount}`);
    console.log(`Threat level: ${registeredCount > 0 ? 'HIGH' : 'LOW'}`);
});
