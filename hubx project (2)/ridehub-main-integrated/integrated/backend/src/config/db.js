/**
 * MongoDB connection module for RideHub backend.
 *
 * Responsibilities:
 *  - Read MONGODB_URI from environment (with sane default for local dev).
 *  - Connect to MongoDB via Mongoose with explicit timeouts.
 *  - Log connection lifecycle events (connect/disconnect/error/reconnect).
 *  - Refuse to start the Express listener if Mongo is unreachable.
 *  - Provide a graceful shutdown hook on SIGINT/SIGTERM.
 *
 * Anti-hallucination note: this module NEVER claims success unless Mongoose
 * emits the 'connected' event. If Mongo is down, the Express app does NOT start.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Mongoose default bufferFileLogging will be fine. We want strictQuery to be
// explicit so unknown query fields don't silently behave as catch-alls (this
// changed from default true to default false in Mongoose 7).
mongoose.set('strictQuery', true);

// Read env. We tolerate the absence of a .env file (dotenv silently ignores
// missing files); the dev default matches the user's stated target URI.
require('dotenv').config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ridehub';

const CONNECT_TIMEOUT_MS = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 10000;
const SERVER_SELECTION_TIMEOUT_MS =
  Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000;

let isShuttingDown = false;

/**
 * Connect to MongoDB. Resolves only after Mongoose's 'connected' event fires.
 * Rejects with a clear Error if connection cannot be established.
 *
 * @returns {Promise<typeof mongoose>}
 */
async function connect() {
  if (mongoose.connection.readyState === mongoose.STATES.connected) {
    return mongoose;
  }

  // Wire event handlers BEFORE calling connect() so we don't miss any events.
  attachConnectionEventHandlers();

  // Pre-flight security / sanity check (LOOP 8): in production, refuse to
  // start if MONGODB_URI contains an inline credential (the password would
  // end up in error messages / logs). Force the use of separate auth.
  // We allow this in dev for convenience but warn.
  const hasInlineCreds = /mongodb(\+srv)?:\/\/[^:\/]+:[^@\/]+@/i.test(MONGODB_URI);
  if (hasInlineCreds && process.env.NODE_ENV === 'production') {
    throw new Error(
      '[db] FATAL: MONGODB_URI contains inline credentials. ' +
        'This is unsafe in production — use a separate auth mechanism or ' +
        'set NODE_ENV=development for local testing.'
    );
  }
  if (hasInlineCreds) {
    console.warn('[db] WARN: MONGODB_URI contains inline credentials. Acceptable for local dev only.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // Use the modern default ServerApi-style options. Do not force any
      // specific serverApi version because we want to remain compatible
      // with vanilla MongoDB 6/7/8 community server (no Atlas required).
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      // Single-node dev setup. Mongoose auto-discovers topology, so we don't
      // need to specify replicaSet/directConnection explicitly.
      dbName: undefined // use the database from the connection string
    });
  } catch (err) {
    // Re-throw a clearer error. We don't swallow — caller (server.js) is
    // responsible for refusing to start Express.
    // SECURITY: never include the raw MONGODB_URI in the error message —
    // it may contain credentials, and the message could end up in logs or,
    // in dev, in a client-visible error response. Use the sanitized form.
    const sanitized = sanitizeUriForLog(MONGODB_URI);
    const enriched = new Error(
      `[db] Failed to connect to MongoDB (${sanitized}) — ${err.message}`
    );
    enriched.cause = err;
    throw enriched;
  }

  return mongoose;
}

/**
 * Strip credentials from a MongoDB URI for safe logging / error reporting.
 * 'mongodb://user:pass@host:27017/db?opts' → 'mongodb://***@host:27017/db?opts'
 */
function sanitizeUriForLog(uri) {
  if (typeof uri !== 'string') return '(non-string uri)';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)[^:\/]+:[^@\/]+@/i, '$1***@');
}

function attachConnectionEventHandlers() {
  const conn = mongoose.connection;

  conn.on('connected', () => {
    // Use sanitized URI in logs too — prevents credential leak if logs are
    // shipped to a central log aggregator.
    console.log(`[db] Connected to MongoDB: ${sanitizeUriForLog(MONGODB_URI)}`);
  });

  conn.on('open', () => {
    console.log(`[db] Connection open (db: "${conn.name}")`);
  });

  conn.on('disconnected', () => {
    // During intentional shutdown, we already printed a clearer message.
    if (!isShuttingDown) {
      console.warn('[db] WARN: MongoDB disconnected. Mongoose will auto-reconnect.');
    }
  });

  conn.on('reconnected', () => {
    console.log('[db] Reconnected to MongoDB after a temporary outage.');
  });

  conn.on('error', (err) => {
    // Mongoose emits 'error' for non-recoverable connection errors. Log only;
    // reconnect attempts are handled internally by the driver.
    console.error('[db] MongoDB connection error:', err.message);
  });
}

/**
 * Gracefully close the connection. Safe to call multiple times.
 */
async function disconnect() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  try {
    await mongoose.disconnect();
    console.log('[db] MongoDB connection closed.');
  } catch (err) {
    console.error('[db] Error during disconnect:', err.message);
  }
}

/**
 * Returns a snapshot of the current connection state for the /api/health
 * endpoint. Never throws.
 */
function health() {
  const stateNumber = mongoose.connection.readyState;
  const stateName =
    Object.keys(mongoose.STATES).find((k) => mongoose.STATES[k] === stateNumber) ||
    'unknown';
  return {
    state: stateName,
    readyState: stateNumber,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    name: mongoose.connection.name || null
  };
}

/**
 * Register SIGINT/SIGTERM hooks so Ctrl-C and `kill` trigger a clean close.
 * Idempotent — safe to call from server.js.
 */
function registerShutdownHooks(server) {
  const shutdown = async (signal) => {
    console.log(`\n[db] Received ${signal}. Shutting down gracefully...`);
    try {
      if (server && typeof server.close === 'function') {
        server.close();
      }
    } catch (e) {
      // ignore — best effort
    }
    await disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = {
  connect,
  disconnect,
  health,
  registerShutdownHooks,
  // Exposed for tests / health probes; do not mutate.
  get MONGODB_URI() {
    return MONGODB_URI;
  }
};
