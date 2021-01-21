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
    const invalidArgumentError = new Error('invalid argument');
    const currencyNotFoundError = new Money.CurrencyNotFoundError();

    it('constructor', function () {
        let m = Money(12.34, 'USD');
        assert(!m.cmp(new Money(12.34, 'USD')));
        assert(!m.cmp(Money(m)));

        m = Money.USD(12.34);
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

        assert.deepEqual(Money(12.34, currency).toJSON(), {amount: '12.34', currency: 'USD'});
        assert.equal(Money(12.34, currency).toString(), '12.34 USD');

        assert.throws(() => Money(12.34, currency).plus(Money(56.78, 'CAD')));
    });
    it('operations mul div mod', function () {
        assert.equal(Money(12.34, currency).mul(3).toFixed(), '37.02');
        assert.equal(Money(12.34, currency).div(2).toFixed(), '6.17');
        assert.equal(Money(12.34, currency).mod(1).toFixed(), '0.34');

        assert.throws(() => Money(12.34, currency).mul(), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mul('a'), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mul(null), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mul(Money.USD(1)), invalidArgumentError);

        assert.throws(() => Money(12.34, currency).div(), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).div('a'), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).div(null), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).div(Money.USD(1)), invalidArgumentError);

        assert.throws(() => Money(12.34, currency).mod(), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mod('a'), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mod(null), invalidArgumentError);
        assert.throws(() => Money(12.34, currency).mod(Money.USD(1)), invalidArgumentError);
    });
    it('exchange', async function () {
        assert.equal(Money(12.34, currency).exchange('USD', rates).toString(), '12.34 USD');
        assert.equal(Money(12.34, currency).exchange('CAD', rates).toString(), '24.68 CAD');
        assert.equal(Money(12.34, currency).exchange('ILS', rates).toString(), '6.17 ILS');
        assert.throws(() => Money(12.34, currency).exchange('OOO', rates).toString(), currencyNotFoundError);
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
    it('integerValue', function () {
        assert.equal(Money(123.45, currency).integerValue(Money.ROUND_DOWN).amount, 123);
        assert.equal(Money(123.45, currency).integerValue(Money.ROUND_UP).amount, 124);
        assert.throws(() => Money(123.45, currency).integerValue());
        assert.throws(() => Money(123.45, currency).integerValue(1));
    });
    it('static sum', function () {
        assert.equal(Money.sum(Money.USD(10), Money.USD(20)).amount, 30);

        assert.throws(() => Money.sum(...[]).amount);
        assert.throws(() => Money.sum(undefined).amount);
        assert.throws(() => Money.sum(null).amount);
        assert.throws(() => Money.sum(null).amount);
        assert.throws(() => Money.sum(3,2,1).amount);
        assert.throws(() => Money.sum(Money.USD(10), Money(10, 'EUR')).amount);
    });
    it('USD Constructor', function () {
        const money = Money.USD(10);

        assert.equal(money.amount, 10);
        assert.equal(money.currency, 'USD');

        assert.throws(() => Money.USD(...[]));
        assert.throws(() => Money.USD(undefined));
        assert.throws(() => Money.USD(null));
        assert.throws(() => Money.USD('a'));
        assert.throws(() => Money.USD(Money(10, 'EUR')));
    });
});
