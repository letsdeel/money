'use strict';
const Big = require('big.js')();

Big.DP = 6;

function Money(amount, currency) {
    if (!(this instanceof Money)) return new Money(...arguments);
    switch (arguments.length) {
        case 1:
            if (amount instanceof Money) Object.assign(this, {amount: amount.amount, currency: amount.currency});
            else if (typeof amount == 'string') {
                const m = amount.match(/^(-?\d+(?:\.\d+)?)([A-Z]{3})$/);
                if (!m) throw new Error('invalid argument');
                Object.assign(this, {amount: Big(m[1]), currency: m[2]});
            } else throw new Error('invalid arguments');
            break;
        case 2:
            if (!/^[A-Z]{3}$/.test(currency)) throw new Error('invalid currency');
            Object.assign(this, {amount: Big(amount), currency});
            break;
        default:
            throw new Error('invalid arguments');
    }
}

Money.USD = function (v) {
    if (v === null || v === undefined) throw new Error('invalid argument');
    if (v instanceof Money && v.currency !== 'USD') throw new Error(`Invalid currency ${v.currency}. Expected USD.`);
    return new Money(v, 'USD');
};

Object.defineProperty(Money, 'SCALE', {
    get() {
        return Big.DP;
    },
    set(scale) {
        Big.DP = scale;
    },
});

Money.prototype.abs = function () {
    return new Money(this.amount.abs(), this.currency);
};

Money.prototype.cmp = function (m) {
    if (!(m instanceof Money) || this.currency !== m.currency) throw new Error('invalid argument');
    return this.amount.cmp(m.amount);
};

Money.prototype.eq = function (m) {
    return !this.cmp(m);
};

Money.prototype.ne = function (m) {
    return this.cmp(m);
};

Money.prototype.gt = Money.prototype.isGreaterThan = function (m) {
    return this.cmp(m) > 0;
};

Money.prototype.gte = function (m) {
    return this.cmp(m) >= 0;
};

Money.prototype.lt = Money.prototype.isLessThan = function (m) {
    return this.cmp(m) < 0;
};

Money.prototype.lte = Money.prototype.isLessThanOrEqualTo = function (m) {
    return this.cmp(m) <= 0;
};

Money.prototype.plus = Money.prototype.add = function (m) {
    if (!(m instanceof Money) || this.currency !== m.currency) throw new Error('invalid argument');
    return new Money(this.amount.plus(m.amount), this.currency);
};

Money.prototype.minus = Money.prototype.sub = function (m) {
    if (!(m instanceof Money) || this.currency !== m.currency) throw new Error('invalid argument');
    return new Money(this.amount.minus(m.amount), this.currency);
};

Money.prototype.mul = Money.prototype.times = Money.prototype.multipliedBy = function (v) {
    if (v === null || v === undefined || v instanceof Money) throw new Error('invalid argument');
    return new Money(this.amount.mul(v), this.currency);
};

Money.prototype.div = Money.prototype.dividedBy = function (v) {
    if (v === null || v === undefined || v instanceof Money) throw new Error('invalid argument');
    return new Money(this.amount.div(v), this.currency);
};

Money.prototype.mod = function (v) {
    if (v === null || v === undefined || v instanceof Money) throw new Error('invalid argument');
    return new Money(this.amount.mod(v), this.currency);
};

Money.prototype.negated = function() { 
    return new Money(this.amount.times(-1), this.currency);
};

Money.prototype.abs = function() { 
    return new Money(this.amount.abs(), this.currency);
};

Money.prototype.toNumber = function() { 
    return this.amount.toNumber();
};

Money.prototype.isZero = function() {
    return this.amount.toNumber() === 0;
};

Money.prototype.isPositive = function() { 
    return this.amount.toNumber() >= 0;
};

Money.prototype.exchange = function (currency, rates) {
    if (this.currency === currency) return this;
    return new Money(this.amount.mul(rates[currency]), currency);
};

// eslint-disable-next-line no-unused-vars
Money.prototype.toFixed = function (scale) {
    return this.amount.toFixed(...arguments);
};

Money.ROUND_DOWN = 0;
Money.ROUND_UP = 3;

Money.prototype.integerValue = function (rm) {
    if (rm === undefined || ![0,3].includes(rm)) throw new Error('invalid argument');
    return new Money(this.amount.round(0, rm), this.currency);
};

Money.prototype.toJSON = function () {
    return {amount: this.toFixed(), currency: this.currency};
};

Money.prototype.toString = function () {
    return `${this.amount.toString()} ${this.currency}`;
};

Money.sum = function (...m) {
    if (!m[0] instanceof Money) throw new Error('invalid argument');
    
    const currency = m[0].currency;

    return m.slice(1, m.length).reduce((a, b) => {
        if (!(a instanceof Money) || currency !== b.currency) throw new Error('invalid argument');
        return a.plus(b);
    }, m[0])
};

Money.max = function(...m) {
    if (!m[0] instanceof Money) throw new Error('invalid argument');
    
    const currency = m[0].currency;

    return m.reduce((acc, a) => {
        if (!(a instanceof Money) || currency !== a.currency) throw new Error('invalid argument');

        if (acc === null || Money(a).gt(acc)) { acc = a; }
        return acc;
      }, null)
};

Money.min = function(...m) {
    if (!m[0] instanceof Money) throw new Error('invalid argument');
    
    const currency = m[0].currency;

    return m.reduce((acc, a) => {
        if (!(a instanceof Money) || currency !== a.currency) throw new Error('invalid argument');

        if (acc === null || Money(a).lt(acc)) { acc = a; }
        return acc;
      }, null)
};

module.exports = Money;
