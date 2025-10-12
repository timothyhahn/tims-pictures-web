/**
 * Mock API server for E2E tests
 * This server mimics the real API backend, allowing E2E tests to run without a real backend
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { mockAlbums, mockPictures } from '../src/lib/test-utils/e2e-mocks';

const PORT = 8080;

function sendJSON(res: ServerResponse, data: unknown, statusCode = 200) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const url = req.url || '';
	const method = req.method || 'GET';

	console.log(`[Mock API] ${method} ${url}`);

	// Albums endpoints
	if (method === 'GET' && url.match(/^\/v1\/albums(\?|$)/)) {
		return sendJSON(res, mockAlbums);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/slug\//)) {
		return sendJSON(res, mockAlbums.data[0]);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/[^/]+(\?|$)/)) {
		return sendJSON(res, mockAlbums.data[0]);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/[^/]+\/pictures/)) {
		return sendJSON(res, mockPictures);
	}

	// Pictures endpoints
	if (method === 'GET' && url.match(/^\/v1\/pictures\/recent/)) {
		return sendJSON(res, mockPictures);
	}

	if (method === 'GET' && url.match(/^\/v1\/pictures\/[^/]+(\?|$)/)) {
		return sendJSON(res, mockPictures.data[0]);
	}

	// Album validation endpoint
	if (method === 'POST' && url.match(/^\/v1\/albums\/slug\/[^/]+\/validate(\?|$)/)) {
		return sendJSON(res, { valid: true });
	}

	// 404 for unmatched routes
	sendJSON(res, { error: 'Not found' }, 404);
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
	console.log(`[Mock API] Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
	console.log('[Mock API] Shutting down...');
	server.close(() => {
		console.log('[Mock API] Server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('[Mock API] Shutting down...');
	server.close(() => {
		console.log('[Mock API] Server closed');
		process.exit(0);
	});
});
