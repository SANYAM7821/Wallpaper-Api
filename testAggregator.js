const { fetchWallhavenWallpapers } = require('./src/services/providers/wallhavenProvider');
const { fetchUnsplashWallpapers } = require('./src/services/providers/unsplashProvider');
const { fetchDuckDuckGoWallpapers } = require('./src/services/providers/duckduckgoProvider');
const { aggregateWallpapers, interleaveAndDeduplicate, normalizeUrl } = require('./src/services/wallpaperAggregator');

async function runTests() {
  console.log('====================================');
  console.log('   WALLPAPER AGGREGATOR TESTS       ');
  console.log('====================================\n');

  // Test 1: Unit Test - Interleaving and Deduplication
  console.log('--- Test 1: Interleaving & Deduplication Unit Test ---');
  const provider1 = [
    { id: '1a', title: 'P1 A', url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/t1.jpg', width: 1920, height: 1080, source: 'p1' },
    { id: '1b', title: 'P1 B', url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/t2.jpg', width: 3840, height: 2160, source: 'p1' }
  ];
  const provider2 = [
    { id: '2a', title: 'P2 A', url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/t1.jpg', width: 1920, height: 1080, source: 'p2' }, // duplicate URL
    { id: '2b', title: 'P2 B', url: 'https://example.com/img3.jpg', thumbnail: 'https://example.com/t3.jpg', width: 2560, height: 1440, source: 'p2' }
  ];

  const interleaved = interleaveAndDeduplicate([provider1, provider2], 30);
  console.log(`Interleaved count: ${interleaved.length} (Expected: 3)`);
  console.log('Interleaved items sources:', interleaved.map(i => i.source));

  if (interleaved.length !== 3) {
    throw new Error('Deduplication or interleaving failed!');
  }

  // Test 2: Integration Test with live query 'gojo wallpaper'
  const query = 'gojo wallpaper';
  console.log(`\n--- Test 2: Live Aggregator Search for "${query}" ---`);

  const results = await aggregateWallpapers(query, { limit: 30 });
  console.log(`Aggregated results count: ${results.length}`);

  if (results.length === 0) {
    console.error('FAILED: No results returned from aggregator');
    process.exit(1);
  }

  console.log('\nFirst 3 results sample:');
  results.slice(0, 3).forEach((item, index) => {
    console.log(`[Item ${index + 1}] Source: ${item.source} | ID: ${item.id}`);
    console.log(`  Title: ${item.title}`);
    console.log(`  URL: ${item.url}`);
    console.log(`  Thumbnail: ${item.thumbnail}`);
    console.log(`  Dimensions: ${item.width}x${item.height}`);
  });

  // Verify Schema
  const schemaValid = results.every(item => (
    typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.title === 'string' &&
    typeof item.url === 'string' && item.url.startsWith('http') &&
    typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http') &&
    typeof item.width === 'number' &&
    typeof item.height === 'number' &&
    typeof item.source === 'string' && ['wallhaven', 'unsplash', 'duckduckgo'].includes(item.source)
  ));

  console.log(`\nAll ${results.length} items strictly adhere to the required JSON schema: ${schemaValid}`);

  if (!schemaValid) {
    throw new Error('Schema validation failed!');
  }

  console.log('\n>>> ALL AGGREGATOR TESTS PASSED SUCCESSFULLY! <<<');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
