global.matchMedia =
    global.matchMedia ||
    function () {
        return {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        };
    };
