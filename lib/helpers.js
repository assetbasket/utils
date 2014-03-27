var api = {},
	Exceptions = require('./exceptions'),
	_ = require('lodash');

module.exports = api;

/**
 * Asserts that the condition passed is true.
 * @param message
 * @param condition
 */
api.assert = function assert (message, condition) {
	if (condition !== true)
		throw new Exceptions.AssertionException(message);
};

/**
 * Helper for currying a function.
 *
 * ### Usage
 *
 * ```javascript
 * // Some function you want to partially apply
 * function someFunc(a, b, c, d) {return arguments;}
 *
 * // Curry the function
 * var curriedFunc = curry(someFunc, null, 'a', 'b');
 *
 * // Returns `['a', 'b', 'c', 'd']`
 * curriedFunc('c', 'd');
 * ```
 *
 * @param  {Function} fn        Function to be curried
 * @param  {mixed}   context    Context the function will be called in
 * @param  {...number} var_args Arguments to partially apply to the function to be called
 * @return {function}           Function with partially applied arguments
 */
api.curry = function (fn, context) {
	// Container for the arguments to call the function with
	var baseArgs = [];

	// Get the arguments to be partially applied
	for (var i = 2, l = arguments.length; i < l; i++) {
		baseArgs.push(arguments[i]);
	}

	// Return a wrapper function
	return function () {
		var args = baseArgs.slice(0);
		// Get the args to call the function with and add them to the args array
		for (var i = 0, l = arguments.length; i < l; i++) {
			args.push(arguments[i]);
		}

		// Call the function with the provided context and arguments
		return fn.apply(context, args);
	};
};

/**
 * Overrides the model's method with a new method that has access to original methods
 * @param model
 * @param name
 * @param method
 */
api.decorateMethod = function decorateMethod (model, name, method) {
	var originalMethod = model[name] || api.noop,
		newMethod = function () {
			var returnVal;

			// Store the _super() method to revert things back to as they were
			var tmp = model._super;

			model._super = originalMethod;

			// Fire off the method with the proper context
			returnVal = method.apply(model, arguments);

			model._super = tmp;

			return returnVal;
		};

	model[name] = newMethod;
};

/**
 * Takes an object and decorates it with methods. Methods with the same name will be overridden
 * but can still be accessed from inside of the decorating method by calling `this._super`.
 * @param obj          Object to be decorated
 * @param decorations  Object of methods that will decorate `obj`
 * @returns {*}
 */
api.decorateObject = function decorateObject (obj, decorations) {
	// Apply the decorations
	_.each(decorations, function (decoration) {
		// Override the methods
		_.each(decoration, function (method, name) {
			api.assert("Decorator method must be a function!", _.isFunction(method));
			api.decorateMethod(obj, name, method);
		});
	});

	return obj;
};

/**
 * Placeholder function that does nothing.
 */
api.noop = function noop () {/* NOOP */};