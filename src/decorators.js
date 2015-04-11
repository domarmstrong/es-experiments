    /**
    * Having the value of 'this' bound can be usefull ins instances like React components
    * where you want to be able to pass instance methods around without having to .bind
    *
    * ```
    * @bound
    * class Comp extends React.Component {
    *   handleClick (event) {
    *     console.log('clicked', this);
    *   }
    *
    *   render () {
    *     // with @bound
    *     return <div onClick={ this.handleClick } />;
    *     // without @bound
    *     return <div onClick={ this.handleClick.bind(this) } />;
    *   }
    * }
    * ```
    */
    export function bound(constructor) {
        // Cant see a way to keep the constructors class name without using eval or such
        // but that would break closures anyway as it would then have the global context
        return class Bound extends constructor {

            constructor (...args) {
                super(...args);

                // Create a bound version of all methods on the class
                // (Using reflect to get all keys including symbols)
                Reflect.ownKeys(constructor.prototype).forEach(key => {
                    // Ignore special case constructor method
                    if (key === 'constructor') return;

                    var descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);

                    // Only methods need binding
                    if (typeof descriptor.value === 'function') {
                        descriptor.value = descriptor.value.bind(this);
                        Object.defineProperty(this, key, descriptor);
                    }
                });
            }
        }
    }
