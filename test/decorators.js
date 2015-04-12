import { bound } from '../src/decorators';
import { assert } from 'chai';

describe('bound', function () {
    it('should bind methods', function () {
        @bound
        class B {
            constructor (val) {
                this.val = val;
            }
            m () {
                return this.val;
            }
        }
        var b = new B(2);
        var m = b.m;

        assert.equal(b.val, 2);
        assert.equal(m(), 2);
    });

    it('should bind methods with symbol keys', function () {
        var symbol = Symbol('m');

        @bound
        class B {
            constructor (val) {
                this.val = val;
            }
            [symbol] () {
                return this.val;
            }
        }
        var b = new B(2);
        var m = b[symbol];

        assert.equal(b.val, 2);
        assert.equal(m(), 2);
    });

    it('should not cause conflicts with multiple symbol keys', function () {
        var symbolM = Symbol('m');
        var symbolN = Symbol('n');

        @bound
        class B {
            constructor (val) {
                this.val = val;
            }
            [symbolM] () {
                return this.val;
            }
            [symbolN] () {
                return this.val + 1;
            }
        }
        var b = new B(2);
        var m = b[symbolM];
        var n = b[symbolN];

        assert.equal(b.val, 2);
        assert.equal(m(), 2);
        assert.equal(n(), 3);
    });

    it('should not bind static methods', function () {
        @bound
        class B {
            constructor (val) {
                this.val = val;
            }
            static m () {
                return this;
            }
        }
        var b = new B(2);
        var m = b.m;

        assert.equal(b.m, undefined);
    });

    it('should bind individual methods', function () {
        class B {
            constructor (val) {
                this.val = val;
            }
            @bound
            m () {
                return this.val;
            }
        }
        var b = new B(2);
        var m = b.m;

        assert.equal(b.m(), 2);
    });
});
