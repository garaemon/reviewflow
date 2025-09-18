import '@testing-library/jest-dom'

// Mock fetch globally for tests
global.fetch = async (url: string | URL | Request, init?: RequestInit) => {
  console.log('API error, falling back to mock session')

  // Return appropriate mock responses based on URL
  const urlString = typeof url === 'string' ? url : url.toString()

  if (urlString.includes('/api/review/sessions')) {
    return new Response(JSON.stringify({ id: 'mock-session', files: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (urlString.includes('/api/health')) {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Not Found', { status: 404 })
}