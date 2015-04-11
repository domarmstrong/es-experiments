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
        assert.equal();
    });
});
