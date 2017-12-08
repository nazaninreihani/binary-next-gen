module.exports = {
    setupTestFrameworkScriptFile: './node_modules/jest-enzyme/lib/index.js',
    setupFiles: [
        '<rootDir>/node_modules/babel-polyfill/',
        '<rootDir>/src/browserMocks.js',
        'raf/polyfill',
        '<rootDir>/src/_utils/enzyme-setup.js',
        '<rootDir>/src/_utils/validateExtend.js'
    ]
};
