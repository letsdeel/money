# Money
Money class for javascript

## Usage
```
const x = Money(12.34, 'USD');
const y = new Money(12.34, 'USD');
const z = x.plus(y);

const total = Money.sum(x, y, z);

const cad = await total.exchange('CAD');
```
