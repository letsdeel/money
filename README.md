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

## Tricks

- If an invalid value is passed to the Money contructor an Error will be thrown by this constructor or the Big.js constructor. BigNumber didn't throw errors, it stored data flagging it as NaN.