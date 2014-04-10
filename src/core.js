(function($){
	"use strict";

	/**
	 * Class definition.
	 *
	 * @param element
	 * @param options
	 * @constructor
	 */
	var Loading = function(element, options) {
		/**
		 * Generate uniqueId for instance.
		 * Uses for non-conflict with DOM elements ID.
		 *
		 * @private
		 * @return {String}
		 */
		var uniqueId = (function() {
			var chars = "abcdefghijklmnopqrstuvwxyz0123456789",
				_length = 50;

			return function(length)
			{
				var max = chars.length - 1,
					id  = '',
					symbol,
					i;

				length || (length = _length);

				for (var x = 0; x < length; x++) {
					i = parseInt(Math.floor(Math.random() * (max + 1)), 10);

					symbol = chars.charAt(i);

					Math.floor(Math.random() * 2) && (symbol = symbol.toUpperCase());

					id+= symbol;
				}

				return id;
			};
		})();

		/**
		 * Resolves which function to use as algorithm.
		 *
		 * @private
		 * @param config
		 *
		 * @throws {Error}
		 *
		 * @returns {Function}
		 */
		var algorithmResolver = function(config) {
			var name, options;

			if (typeof config === 'function') {
				return config;
			}

			if (typeof config === 'string') {
				name = config;
			} else {
				name = config.name;
				config.options && (options = config.options);
			}

			if (Loading.algorithm.hasOwnProperty(name)) {
				var algorithm = Loading.algorithm[name];
				options && (algorithm.options = options);

				return algorithm;
			} else {
				throw new Error('Algorithm not found: "' + name + '"');
			}
		};

		/**
		 * Resolves which function to use as effect.
		 *
		 * @private
		 *
		 * @param config
		 *
		 * @throws {Error}
		 *
		 * @returns {Function}
		 */
		var effectResolver = function(config) {
			var effect, name, options;

			if (typeof config == 'function') {
				effect = config;
				effect.count = 1;
				return effect;
			}

			if (config instanceof Array) {
				var effects = [];
				for (var x = 0; x < config.length; x++) {
					effects.push(effectResolver(config[x]));
				}

				effect = function() {
					for (var x = 0; x < effects.length; x++) {
						effects[x].apply(null, arguments);
					}
				};
				effect.count = effects.length;

				return effect;

			} else {
				if (typeof config === 'string') {
					name = config;
				} else {
					name = config.name;
					config.options && (options = config.options);
				}

				if (Loading.effect.hasOwnProperty(name)) {
					effect = Loading.effect[name];
					effect.count = 1;
					options && (effect.options = options);
					return effect;
				} else {
					throw new Error('Effect not found: "' + name + '"');
				}
			}
		};

		/**
		 * Normalizes given options.
		 *
		 * @private
		 *
		 * @param options
		 * @param dimensions
		 *
		 * @returns {*}
		 */
		var optionsNormalizer = function(options, dimensions) {
			var	spinner = options.spinner,
				matrix  = options.spinner.matrix,
				pin     = options.spinner.pin,
				answer  = $.extend({}, options);

			if (/^[0-9]{1,3}%$/.test(spinner.width)) {
				spinner.width = (dimensions.width / 100) * spinner.width.substr(0, spinner.width.length - 1);
			}

			if (/^[0-9]{1,3}%$/.test(spinner.height)) {
				spinner.height = (dimensions.height / 100) * spinner.height.substr(0, spinner.height.length - 1);
			}

			if (!matrix.x || !matrix.y) {
				answer.spinner.matrix.x = Math.floor(spinner.width / (pin.width + pin.margin.left + pin.margin.right));
				answer.spinner.matrix.y = Math.floor(spinner.height / (pin.height + pin.margin.top + pin.margin.bottom));
			} else {
				answer.spinner.pin.width = Math.floor((spinner.width - ((pin.margin.right + pin.margin.left) * matrix.x)) / matrix.x);
				answer.spinner.pin.height = Math.floor((spinner.height - ((pin.margin.top + pin.margin.bottom) * matrix.y)) / matrix.y);
			}

			answer.spinner.matrix.x-= 1;
			answer.spinner.matrix.y-= 1;

			if (answer.spinner.pin.width <= 0 || answer.spinner.pin.height <= 0) {
				throw new Error('There is not enough space for spinner.');
			}

			return answer;
		};

		/**
		 * Creates background element.
		 *
		 * @private
		 *
		 * @returns {HTMLElement}
		 */
		var createBackground = function(options, dimensions) {
			var background = $('<div/>');

			var hardCss = {
				position: 'absolute',
				top: 0,
				left: 0
			};

			background.css($.extend({}, options.css, hardCss, dimensions));

			return background;
		};

		/**
		 * Creates pin.
		 *
		 * @param {Object} options
		 * @param {Object} position
		 *
		 * @returns {HTMLElement}
		 */
		var createPin = function(options, position) {
			var pin = $('<div/>');

			var hardCss = {
				position:   'absolute',
				width:      options.width,
				height:     options.height,
				top:        position.y * (options.height +options.margin.top + options.margin.bottom),
				left:       position.x * (options.width +options.margin.left + options.margin.right)
			};

			pin
				.css($.extend(options.css, hardCss))
				.attr({
					'class': 'loading-pin'
				});

			return pin;
		};

		/**
		 * Creates matrix of pins.
		 *
		 * @param options
		 * @returns {Array}
		 */
		var createPins = function(options) {
			var pins = [];

			for (var x = 0; x <= options.matrix.x; x++) {
				pins[x] || (pins[x] = []);
				for (var y = 0; y <= options.matrix.y; y++) {
					pins[x][y] = createPin(options.pin, {x:x, y:y});
				}
			}

			return pins;
		};

		/**
		 * Creates spinner element.
		 *
		 * @private
		 *
		 * @returns {HTMLElement}
		 */
		var createSpinner = function(options, dimensions, pins) {
			var spinner = $('<div/>');

			spinner.css({
				position: 'absolute',
				left:     (dimensions.width - options.width) /2,
				top:      (dimensions.height - options.height) / 2,
				width:    options.width,
				height:   options.height
			});

			for (var x = 0; x < pins.length; x++) {
				for (var y = 0; y < pins[x].length; y++) {
					spinner.append(pins[x][y]);
				}
			}

			return spinner;
		};

		// Constructor

		options || (options = {});

		this.target  = element;
		this.id      = uniqueId(50);

		this.dimensions = {
			width:  this.target.outerWidth(),
			height: this.target.outerHeight(),
			top:    this.target.offset().top,
			left:   this.target.offset().left
		};

		this.options = optionsNormalizer($.extend(true, {}, $.fn.loading.defaults, options), this.dimensions);

		this.runtime = {
			progress: 0,
			interval: null
		};

		this.pins = createPins(this.options.spinner);

		this.background = createBackground(this.options.background, this.dimensions);
		this.spinner    = createSpinner(this.options.spinner, this.dimensions, this.pins);

		this.algorithm = algorithmResolver(this.options.algorithm);
		this.algorithmData = null;

		this.effect = effectResolver(this.options.effect);

		this.counter = 0;

		this.update(options.runtime);
	};

	Loading.prototype = (function() {
		/**
		 * Checking runtime options.
		 *
		 * @private
		 * @static
		 */
		var _checkRuntime = function() {
			if ((typeof this.runtime.progress == 'number' && this.runtime.progress >= 100)) {
				_destruct.call(this);
				return;
			}

			if (typeof this.runtime.interval == 'number' && this.runtime.interval != this.actualInterval) {
				this.pause();
				this.resume(this.runtime.interval);
			}
		};

		/**
		 * Deletes Loading instance.
		 *
		 * @private
		 * @static
		 */
		var _destruct = function() {
			clearInterval(this.intervalId);

			// maybe here must apply easeOut fx, then on fx ends, remove all divs
			this.background.remove();

			this.target.removeData('loading');
		};

		return {
			/**
			 * Save reference to the constructor.
			 */
			constructor: Loading,

			/**
			 * Initializes runtime parameters.
			 *
			 * @param options Runtime options
			 */
			update: function(options) {
				options || (options = {});
				$.extend(true, this.runtime, options);
			},

			/**
			 * Shows loading element.
			 */
			show: function() {
				this.background.append(this.spinner).appendTo(document.body);//.appendTo(this.target);
			},

			/**
			 * Starts animation.
			 */
			start: function(interval)
			{
				this.actualInterval = interval || this.options.spinner.interval;

				if (this.actualInterval > 0x7fffffff) this.actualInterval = 0x7fffffff;

				var loading = this,
					matrix = {x: this.options.spinner.matrix.x, y: this.options.spinner.matrix.y},
					effectInterval = Math.round(this.actualInterval/this.effect.count);

				this.intervalId = setInterval(function() {
					loading.algorithmData = loading.algorithm(matrix, loading.algorithmData);
					loading.effect(loading.pins[loading.algorithmData.x][loading.algorithmData.y], effectInterval, loading.runtime);
					loading.counter++;

					// call private method
					_checkRuntime.call(loading);
				}, this.actualInterval);
			},

			/**
			 * Pauses animation.
			 */
			pause: function()
			{
				clearInterval(this.intervalId);
			},

			/**
			 * Resumes animation.
			 *
			 * @param interval
			 */
			resume: function(interval)
			{
				this.start(interval);
			}
		};
	})();

	/**
	 * Container for algorithm functions.
	 * @type {Object}
	 */
	Loading.algorithm = {};

	/**
	 * Container for effect functions.
	 * @type {Object}
	 */
	Loading.effect    = {};

	/**
	 * jQuery plugin definition.
	 * @param options
	 */
	$.fn.loading = function(options) {
		var loading;

		if (!this.data('loading')) {
			loading = new Loading(this, options);
			this.data({loading: loading});

			loading.show();
			loading.start();
		} else {
			loading = this.data('loading');

			loading.update(options);
		}
	};

	/**
	 * Gives an ability for adding custom algorithms.
	 *
	 * @param {String} name
	 * @param {Function} algorithm
	 * @param {Object} [options]
	 */
	$.fn.loading.algorithm = function(name, algorithm, options) {
		Loading.algorithm[name] = algorithm;
		if (options) {
			Loading.algorithm[name].options = options;
		}
	};

	/**
	 * Gives an ability for adding custom effects.
	 *
	 * @param {String} name
	 * @param {Function} effect
	 * @param {Object} [options]
	 */
	$.fn.loading.effect = function(name, effect, options) {
		Loading.effect[name] = effect;
		if (options) {
			Loading.effect[name].options = options;
		}
	};


	return Loading;
})(jQuery);
