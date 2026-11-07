import '@testing-library/jest-dom';

// JSDOM mock for ResizeObserver (used by cmdk)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock HTMLElement.scrollIntoView for cmdk
window.HTMLElement.prototype.scrollIntoView = function () {};
