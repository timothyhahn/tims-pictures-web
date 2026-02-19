/**
 * Mock API server for E2E tests
 * This server mimics the real API backend, allowing E2E tests to run without a real backend
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
	mockAlbums,
	mockPictures,
	mockPrivateAlbum,
	PRIVATE_ALBUM_PASSWORD,
	MOCK_JWT_TOKEN
} from '../src/lib/test-utils/e2e-mocks';

const PORT = 8080;

function sendJSON(res: ServerResponse, data: unknown, statusCode = 200) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve) => {
		let body = '';
		req.on('data', (chunk) => (body += chunk));
		req.on('end', () => resolve(body));
	});
}

function isPrivateAlbumSlug(url: string): boolean {
	return url.includes(`/slug/${mockPrivateAlbum.slug}`);
}

function hasValidAuth(req: IncomingMessage): boolean {
	const auth = req.headers['authorization'];
	return auth === `Bearer ${MOCK_JWT_TOKEN}`;
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const url = req.url || '';
	const method = req.method || 'GET';

	console.log(`[Mock API] ${method} ${url}`);

	// Album validation endpoint (must be before slug match)
	if (method === 'POST' && url.match(/^\/v1\/albums\/slug\/[^/]+\/validate(\?|$)/)) {
		const body = await readBody(req);
		try {
			const { password } = JSON.parse(body);
			if (password === PRIVATE_ALBUM_PASSWORD) {
				return sendJSON(res, { token: MOCK_JWT_TOKEN });
			}
		} catch {
			// invalid JSON
		}
		return sendJSON(res, { error: 'Invalid password' }, 401);
	}

	// Albums endpoints
	if (method === 'GET' && url.match(/^\/v1\/albums(\?|$)/)) {
		return sendJSON(res, mockAlbums);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/slug\//)) {
		if (isPrivateAlbumSlug(url)) {
			if (!hasValidAuth(req)) {
				return sendJSON(res, { error: 'Forbidden' }, 403);
			}
			return sendJSON(res, mockPrivateAlbum);
		}
		return sendJSON(res, mockAlbums.data[0]);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/[^/]+\/pictures/)) {
		return sendJSON(res, mockPictures);
	}

	if (method === 'GET' && url.match(/^\/v1\/albums\/[^/]+(\?|$)/)) {
		return sendJSON(res, mockAlbums.data[0]);
	}

	// Pictures endpoints
	if (method === 'GET' && url.match(/^\/v1\/pictures\/recent/)) {
		return sendJSON(res, mockPictures);
	}

	if (method === 'GET' && url.match(/^\/v1\/pictures\/[^/]+(\?|$)/)) {
		return sendJSON(res, mockPictures.data[0]);
	}

	// 404 for unmatched routes
	sendJSON(res, { error: 'Not found' }, 404);
}

const server = createServer((req, res) => {
	handleRequest(req, res).catch((err) => {
		console.error('[Mock API] Error:', err);
		sendJSON(res, { error: 'Internal server error' }, 500);
	});
});

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
