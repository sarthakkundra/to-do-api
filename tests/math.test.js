const {fahrenheitToCelsius, celsiusToFahrenheit } = require('../src/playgroud');

test('converts 32F to 0C', () =>{
    const temp = fahrenheitToCelsius(32)
    expect(temp).toBe(0)
})

test('Convert 0C to 32F', () =>{
    const temp = celsiusToFahrenheit(0)
    expect(temp).toBe(32);
})