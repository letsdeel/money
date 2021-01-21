const errors = {};
for (const name of ['CurrencyNotFoundError']) {
    errors[name] = Object.assign(
        function (message = '') {
            this.name = name;
            this.message = message;
        },
        {prototype: Object.create(Error.prototype)}
    );
}

Object.assign(module.exports, errors);
