'use strict';
const assert = require('assert');
const Money = require('./');

const currency = 'USD';

const rates = { 
    USD: 1, 
    CAD: 2, 
    ILS: 0.5
};

describe('global', function () {
    afterEach(function () {
        Money.SCALE = 6;
    });

    it('default scale', function () {
        assert.equal(Money.SCALE, 6);
        assert.equal(Money(12.345678, currency).toFixed(), '12.345678');
    });

    it('changing scale', function () {
        Money.SCALE = 2;
        assert.equal(Money.SCALE, 2);
        assert.equal(Money(12.345678, currency).toFixed(Money.SCALE), '12.35');
    });
});

describe('methods', function () {
    it('constructor', function () {
        const m = Money(12.34, 'USD');
        assert(!m.cmp(new Money(12.34, 'USD')));
        assert(!m.cmp(Money(m)));

        assert.throws(() => Money());
        assert.throws(() => Money(1));
        assert.throws(() => Money(1, currency, 2));
    });
    it('comparison', function () {
        const v = [12.34, 56.78];

        assert.equal(Money(v[0], currency).cmp(Money(v[0], currency)), 0);
        assert.equal(Money(v[0], currency).cmp(Money(v[1], currency)), -1);
        assert.equal(Money(v[1], currency).cmp(Money(v[0], currency)), 1);

        assert(Money(v[0], currency).eq(Money(v[0], currency)));
        assert(!Money(v[0], currency).eq(Money(v[1], currency)));

        assert(Money(v[0], currency).ne(Money(v[1], currency)));
        assert(!Money(v[0], currency).ne(Money(v[0], currency)));

        assert(Money(v[1], currency).gt(Money(v[0], currency)));
        assert(!Money(v[1], currency).gt(Money(v[1], currency)));
        assert(Money(v[1], currency).gte(Money(v[0], currency)));
        assert(Money(v[1], currency).gte(Money(v[1], currency)));

        assert(Money(v[0], currency).lt(Money(v[1], currency)));
        assert(!Money(v[0], currency).lt(Money(v[0], currency)));
        assert(Money(v[0], currency).lte(Money(v[1], currency)));
        assert(Money(v[0], currency).lte(Money(v[0], currency)));

        assert.throws(() => Money(v[0], currency).cmp(Money(v[0], 'CAD')));
    });
    it('operations', function () {
        assert(Money(-12.34, currency).abs().eq(Money(12.34, currency)));

        assert.equal(Money(12.34, currency).plus(Money(56.78, currency)).toFixed(), '69.12');
        assert.equal(Money(12.34, currency).minus(Money(56.78, currency)).toFixed(), '-44.44');
        assert.equal(Money(12.34, currency).mul(3).toFixed(), '37.02');
        assert.equal(Money(12.34, currency).div(2).toFixed(), '6.17');

        assert.deepEqual(Money(12.34, currency).toJSON(), {amount: '12.34', currency: 'USD'});
        assert.equal(Money(12.34, currency).toString(), '12.34 USD');

        assert.equal(
            Money.sum(Money(12.34, currency), Money(12.34, currency), Money(12.34, currency)).toFixed(),
            '37.02'
        );

        assert.throws(() => Money(12.34, currency).plus(Money(56.78, 'CAD')));
    });
    it('exchange', async function () {
        assert.equal(Money(12.34, currency).exchange('USD', rates).toString(), '12.34 USD');
        assert.equal(Money(12.34, currency).exchange('CAD', rates).toString(), '24.68 CAD');
        assert.equal(Money(12.34, currency).exchange('ILS', rates).toString(), '6.17 ILS');
    });
    it('negated', function () {
        assert.equal(Money(12.34, currency).negated().toFixed(), '-12.34');
        assert.equal(Money(-12.34, currency).negated().toFixed(), '12.34');
    });
    it('abs', function () {
        assert.equal(Money(-12.34, currency).negated().toFixed(), '12.34');
    });
    it('max', function () {
        assert.equal(Money.max(Money(1, currency), Money(2, currency), Money(3, currency)).toNumber(), 3);
        assert.throws(() => Money.max(Money(1, 'USD'), Money(3, 'BRL')));
        assert.throws(() => Money.max(Money(1, currency), 2, Money(3, currency)));
    });
    it('min', function () {
        assert.equal(Money.min(Money(1, currency), Money(2, currency), Money(3, currency)).toNumber(), 1);
        assert.throws(() => Money.min(Money(1, 'USD'), Money(3, 'BRL')));
        assert.throws(() => Money.min(Money(1, currency), 2, Money(3, currency)));
    });
    it('toNumber', function () {
        assert.equal(Money(1, currency).toNumber(), 1);
        assert.equal(Money(1.1, currency).toNumber(), 1.1);
        assert.equal(Money(0, currency).toNumber(), 0);
        assert.equal(Money(-1, currency).toNumber(), -1);
    });
    it('isZero', function () {
        assert.equal(Money(1, currency).isZero(), false);
        assert.equal(Money(1.1, currency).isZero(), false);
        assert.equal(Money(0, currency).isZero(), true);
        assert.equal(Money(-1, currency).isZero(), false);
    });
    it('isPositive', function () {
        assert.equal(Money(1, currency).isPositive(), true);
        assert.equal(Money(0, currency).isPositive(), true);
        assert.equal(Money(-1, currency).isPositive(), false);
    });
});
