const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

// Mock successful responses
fetchMock.mockResponse(request => {
  if (request.url === 'https://my.farm.bot/api/token') {
    return Promise.resolve(JSON.stringify({ ok: true }));
  }
  if (request.url === 'https://my.farm.bot/api/points?filter=plant') {
    return Promise.resolve(JSON.stringify([
      {
        id: 1,
        x: 100,
        y: 200,
        z: 20,
        name: "Test Plant 1"
      },
      {
        id: 2,
        x: 300,
        y: 400,
        z: 10,
        name: "Test Plant 2"
      }
    ]));
  }
  return Promise.reject(new Error(`Unhandled request: ${request.url}`));
});