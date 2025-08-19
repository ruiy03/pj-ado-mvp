import '@testing-library/jest-dom';

// テスト用環境変数を設定
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

// Suppress console.error and console.log during tests
const originalError = console.error;
const originalLog = console.log;

beforeEach(() => {
  // Suppress console.error and console.log during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  // Restore original console methods
  console.error.mockRestore();
  console.log.mockRestore();
});

// Mock TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web APIs for Next.js
global.Headers = class Headers extends Map {
  constructor(init) {
    super();
    if (init) {
      if (init instanceof Headers) {
        for (const [key, value] of init) {
          this.set(key, value);
        }
      } else if (Array.isArray(init)) {
        for (const [key, value] of init) {
          this.set(key, value);
        }
      } else if (typeof init === 'object') {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value);
        }
      }
    }
  }
  
  get(name) {
    return super.get(name.toLowerCase());
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), String(value));
  }
  
  has(name) {
    return super.has(name.toLowerCase());
  }
  
  delete(name) {
    return super.delete(name.toLowerCase());
  }
};

// Mock Request for API tests
global.Request = class Request {
  constructor(url, options = {}) {
    this._url = url;
    this.method = options.method || 'GET';
    this.headers = new global.Headers(options.headers);
    this._body = options.body;
  }
  
  get url() {
    return this._url;
  }
  
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }
  
  async text() {
    return String(this._body || '');
  }
  
  async formData() {
    return this._body;
  }
};

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new global.Headers(options.headers);
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
  
  async blob() {
    return this.body;
  }
  
  static json(body, options = {}) {
    return new Response(JSON.stringify(body), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
};

// Mock NextResponse
global.NextResponse = global.Response;

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this._data = new Map();
  }
  
  append(name, value, filename) {
    if (!this._data.has(name)) {
      this._data.set(name, []);
    }
    this._data.get(name).push(value);
  }
  
  get(name) {
    const values = this._data.get(name);
    return values ? values[0] : null;
  }
  
  getAll(name) {
    return this._data.get(name) || [];
  }
  
  has(name) {
    return this._data.has(name);
  }
  
  set(name, value) {
    this._data.set(name, [value]);
  }
  
  delete(name) {
    this._data.delete(name);
  }
  
  entries() {
    const entries = [];
    for (const [key, values] of this._data) {
      for (const value of values) {
        entries.push([key, value]);
      }
    }
    return entries[Symbol.iterator]();
  }
  
  keys() {
    return this._data.keys();
  }
  
  values() {
    const values = [];
    for (const valueArray of this._data.values()) {
      values.push(...valueArray);
    }
    return values[Symbol.iterator]();
  }
  
  [Symbol.iterator]() {
    return this.entries();
  }
};

// Mock File - define after Blob
// This will be moved after Blob definition

// Mock Blob
global.Blob = class Blob {
  constructor(parts = [], options = {}) {
    this.type = options.type || '';
    this._content = parts.join('');
  }
  
  async text() {
    return this._content;
  }
  
  async arrayBuffer() {
    return new TextEncoder().encode(this._content).buffer;
  }
  
  slice(start, end, contentType) {
    const sliced = this._content.slice(start, end);
    return new Blob([sliced], { type: contentType });
  }
  
  get size() {
    return this._content.length;
  }
};

// Mock File
global.File = class File extends global.Blob {
  constructor(fileBits, fileName, options = {}) {
    super(fileBits, options);
    
    // Define properties using Object.defineProperty to avoid read-only issues
    Object.defineProperty(this, 'name', {
      value: fileName,
      writable: false,
      enumerable: true,
      configurable: false
    });
    
    Object.defineProperty(this, 'lastModified', {
      value: options.lastModified || Date.now(),
      writable: false,
      enumerable: true,
      configurable: false
    });
    
    // Override type property if needed
    if (options.type && options.type !== this.type) {
      Object.defineProperty(this, 'type', {
        value: options.type,
        writable: false,
        enumerable: true,
        configurable: false
      });
    }
  }
};

// Mock NextURL and other Next.js specific objects
global.URL = global.URL || class URL {
  constructor(url) {
    this.href = url;
    this.pathname = url.split('?')[0];
    this.search = url.includes('?') ? '?' + url.split('?')[1] : '';
  }
};

// Mock NextRequest with proper property descriptors
global.NextRequest = class NextRequest extends global.Request {
  constructor(url, options = {}) {
    super(url, options);
    // Define nextUrl as a property to avoid getter-only error
    Object.defineProperty(this, 'nextUrl', {
      value: new global.URL(url),
      writable: true,
      configurable: true
    });
    this.geo = {};
    this.ip = '127.0.0.1';
  }
};

// Mock DOM methods for testing
Element.prototype.scrollIntoView = jest.fn();

// Mock next-auth for API tests
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock auth module
jest.mock('./src/auth', () => ({
  auth: jest.fn(),
}));

// Mock Vercel Blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
}));
