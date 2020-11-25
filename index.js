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
    return new Money(this.amount.mul(v), this.currency);
};

Money.prototype.div = Money.prototype.dividedBy = function (v) {
    return new Money(this.amount.div(v), this.currency);
};

Money.prototype.mod = function (v) {
    return new Money(this.amount.mod(v), this.currency);
};

Money.prototype.negated = function() { 
    return new Money(this.amount.times(-1), this.currency);
};

Money.prototype.abs = function() { 
    return new Money(this.amount.abs(), this.currency);
};

Money.prototype.isNaN = function() { 
    throw new Error('not implemented - should be implemented?'); 
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

Money.prototype.exchange = async function (currency, rates) {
    if (this.currency === currency) return this;
    return new Money(this.amount.mul(rates[currency]), currency);
};

// eslint-disable-next-line no-unused-vars
Money.prototype.toFixed = function (scale) {
    return this.amount.toFixed(...arguments);
};

Money.prototype.toJSON = function () {
    return {amount: this.toFixed(), currency: this.currency};
};

Money.prototype.toString = function () {
    return `${this.amount.toString()} ${this.currency}`;
};

Money.sum = function (...m) {
    return m.reduce((a, b) => a.plus(b));
};

Money.max = function(...m) {
    return m.reduce((acc, a) => {
        if (acc === null || a.gt(acc)) { acc = a; }
        return acc;
      }, null)
};

Money.min = function(...m) { 
    return m.reduce((acc, a) => {
        if (acc === null || a.lt(acc)) { acc = a; }
        return acc;
      }, null)
};

module.exports = Money;
