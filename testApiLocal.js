const axios = require('axios');
const app = require('./src/app');

async function testLocalApi() {
  const PORT = 3000;
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    try {
      console.log('\n--- 1. Health Check (GET /) ---');
      const healthRes = await axios.get(`http://localhost:${PORT}/`);
      console.log('Health status code:', healthRes.status);
      console.log('Health response payload:', healthRes.data);

      console.log('\n--- 2. Query: "gojo wallpaper" ---');
      const gojoRes = await axios.get(`http://localhost:${PORT}/api/wallpapers?query=gojo%20wallpaper`);
      console.log('Status code:', gojoRes.status);
      console.log('Success:', gojoRes.data.success);
      console.log('Query:', gojoRes.data.query);
      console.log('Count:', gojoRes.data.count);
      console.log('Items length:', gojoRes.data.data.length);

      if (gojoRes.data.data.length > 0) {
        console.log('Sample item 0:', JSON.stringify(gojoRes.data.data[0], null, 2));
      }

      // Check schema for all items
      const gojoSchemaValid = gojoRes.data.data.every(item =>
        typeof item.id === 'string' && item.id &&
        typeof item.title === 'string' &&
        typeof item.url === 'string' && item.url.startsWith('http') &&
        typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http') &&
        typeof item.width === 'number' &&
        typeof item.height === 'number' &&
        typeof item.source === 'string'
      );
      console.log('All "gojo wallpaper" items match required schema:', gojoSchemaValid);


      console.log('\n--- 3. Query: "anime wallpaper" ---');
      const animeRes = await axios.get(`http://localhost:${PORT}/api/wallpapers?query=anime%20wallpaper`);
      console.log('Status code:', animeRes.status);
      console.log('Success:', animeRes.data.success);
      console.log('Query:', animeRes.data.query);
      console.log('Count:', animeRes.data.count);
      console.log('Items length:', animeRes.data.data.length);

      if (animeRes.data.data.length > 0) {
        console.log('Sample item 0:', JSON.stringify(animeRes.data.data[0], null, 2));
      }


      console.log('\n--- 4. Missing query parameter ---');
      try {
        await axios.get(`http://localhost:${PORT}/api/wallpapers`);
      } catch (err) {
        if (err.response) {
          console.log('Status code:', err.response.status);
          console.log('Error payload:', err.response.data);
        } else {
          console.error('Unexpected error:', err.message);
        }
      }

      console.log('\n--- ALL LOCAL E2E API TESTS COMPLETED ---');
    } catch (err) {
      console.error('Error during local API test:', err.message);
      if (err.response) {
        console.error('Response data:', err.response.data);
      }
    } finally {
      server.close(() => {
        console.log('Test server closed');
        process.exit(0);
      });
    }
  });
}

testLocalApi();
