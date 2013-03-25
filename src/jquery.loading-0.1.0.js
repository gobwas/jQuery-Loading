/**
 * jquery.loading - plugin that creates pretty loading spinners for ur elements.
 *
 * Version: 0.1.0
 *
 * Copyright 2013, Sergey Kamardin.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: 22.03.2013
 * Location: Moscow, Russia.
 * Contact: gobwas@gmail.com
 *
 *
 *         ___         ___           ___           ___           ___
 *        /\  \       /\__\         /\  \         /\__\         /\__\
 *       /::\  \     /:/ _/_       /::\  \       /:/  /        /:/ _/_
 *      /:/\:\__\   /:/ /\__\     /:/\:\  \     /:/  /        /:/ /\__\
 *     /:/ /:/  /  /:/ /:/ _/_   /:/ /::\  \   /:/  /  ___   /:/ /:/ _/_
 *    /:/_/:/  /  /:/_/:/ /\__\ /:/_/:/\:\__\ /:/__/  /\__\ /:/_/:/ /\__\
 *    \:\/:/  /   \:\/:/ /:/  / \:\/:/  \/__/ \:\  \ /:/  / \:\/:/ /:/  /
 *     \::/__/     \::/_/:/  /   \::/__/       \:\  /:/  /   \::/_/:/  /
 *      \:\  \      \:\/:/  /     \:\  \        \:\/:/  /     \:\/:/  /
 *       \:\__\      \::/  /       \:\__\        \::/  /       \::/  /
 *        \/__/       \/__/         \/__/         \/__/         \/__/
 *
 */


(function($){

	var Loading = function(element, options)
	{
		options || (options = {});

		this.target = element;

		this.id = this.code(50);

		this._dimensions = this.dimensions();

		this.options = {
			opacity:    0.9,
			speedIn:    300,
			speedOut:   1000,
			spinner: {
				width:  30,
				height: 10,
				src:    'content/images/loading4.gif'
			},
			spinnerDOM: {
				width:   17,
				height:  17,
				matrix: {
					columns: null,
					rows:    null
				},
				pin: {
					width:  3,
					height: 3,
					margin: {
						top:    1,
						right:  1,
						bottom: 0,
						left:   0
					}
				},
				interval: 50,
				effects: {
					rows:    null,
					columns: null,
					pins:    null
				}
			},
			background: {
				color:        'white',
				position:     '',
				img:          null,
				borderRadius: 1
			}
		};

		$.extend(this.options, options, true);
	};

	$.extend(Loading.prototype, {
		code: (function() {

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
					i = parseInt(Math.floor(Math.random() * (max + 1)));

					symbol = chars.charAt(i);

					Math.floor(Math.random() * 2) && (symbol = symbol.toUpperCase());

					id+= symbol;
				}

				return id;
			};
		})(),

		dimensions: function()
		{
			var dimensions = {
				position: 'absolute',
				top:      this.target.offset().top,
				left:     this.target.offset().left,
				width:    this.target.outerWidth(),
				height:   this.target.outerHeight()
			};

			return dimensions;
		},

		background: function()
		{
			var background = $('<div/>');

			var css = {
				position: 'absolute'
			};

			$.extend(css, this._dimensions);

			css.background = this.options.background.img
				? this.options.background.color + ' url('+this.options.background.img+') ' + this.options.background.position
				: this.options.background.color;

			this.options.background.borderRadius && (css['border-radius'] = this.options.background.borderRadius);

			background
				.css(css)
				.attr({
					id: 'background-' + this.id
				});

			return background;
		},

		spinner: function()
		{
			var spinner = $('<img/>'),
				width   = this.options.spinner.width,
				height  = this.options.spinner.height;


			spinner
				.attr({
					src: this.options.spinner.src
				})
				.css({
					position: 'absolute',
					left:     (this._dimensions.width - width) /2,
					top:      (this._dimensions.height - height) / 2,
					width:    width,
					height:   height
				});

			return spinner;
		},

		spinnerDOM: (function() {

			var mergeMargin = function(margin) {
				return margin.top + 'px ' + margin.right + 'px ' + margin.bottom + 'px ' + margin.left + 'px';
			}

			return function()
			{
				var	config = this.options.spinnerDOM;

				if (!config.matrix.columns || !config.matrix.rows) {
					config.matrix.columns = Math.floor(config.width / (config.pin.width + config.pin.margin.left + config.pin.margin.right));
					config.matrix.rows    = Math.floor(config.height / (config.pin.height + config.pin.margin.top + config.pin.margin.bottom));
				} else {
					config.pin.width = Math.floor((config.width - ((config.pin.margin.right + config.pin.margin.left) * config.matrix.columns)) / config.matrix.columns);
					config.pin.height = Math.floor((config.height - ((config.pin.margin.top + config.pin.margin.bottom) * config.matrix.rows)) / config.matrix.rows);
				}

				if (config.pin.width <= 0 || config.pin.height <= 0) {
					throw new Error('There is not enough space for spinner.');
				}

				var spinner = $('<div/>');
				spinner.css({
					position: 'absolute',
					left:     (this._dimensions.width - config.width) /2,
					top:      (this._dimensions.height - config.height) / 2,
					width:    config.width,
					height:   config.height
				});

				var clearfix = $('<div/>').css({clear: 'both'});

				var pins = {};

				for (var y = 0; y < config.matrix.rows; y++) {
					pins[y] = {};
					for (var x = 0; x < config.matrix.columns; x++) {
						pins[y][x] = $('<div/>')
							.css({
								margin:     mergeMargin(config.pin.margin),
								width:      config.pin.width,
								background: 'green',
								height:     config.pin.height,
								float:      'left',
								opacity:    0
								//display:    'none'
							})
							.data({
								y: y,
								x: x
							})
							.data('sign', true)
							.appendTo(spinner)
					}
					spinner.append(clearfix.clone());
				}

				this._pins = pins;

				return spinner;
			}
		})(),

		runInterval: (function() {


            var snakeInterval = function(pins, options, step, position, sign, interval, circles, start)
            {
                step     || (step = {x: 0, y: 0});
                position || (position = {x: 0, y: 0});
                interval || (interval = 0);
                circles  || (circles = 0);
                start    || (start = {x: 0, y: 0});

                position.x+= step.x;
                position.y+= step.y;

                if (position.x == start.x && position.y == start.y && circles != 0) {
                    position.x++;
                    position.y++;
                    start.x++;
                    start.y++;
                    options.matrix.x--;
                    options.matrix.y--;
                }

                if ((options.matrix.x - start.x) <= 0 || (options.matrix.y - start.y) <= 0) {
                    position = {x: 0, y: 0};
                    start = {x: 0, y: 0};
                    options.matrix = JSON.parse(JSON.stringify({
                        x: options._matrix.columns - 1,
                        y: options._matrix.rows - 1
                    }));
                }

                circles++;

                /*setTimeout((function(pin){ return function() {
                    effect(pin);
                }})(pins[position.y][position.x]), interval);*/

                effect(pins[position.y][position.x]);

                interval+= options.interval;

                var columns = options.matrix.x,
                    rows    = options.matrix.y;

                if (position.x == start.x && position.y == start.y) {
                    sign = 1;
                } else if (position.x == columns && position.y == rows) {
                    sign = 0;
                }

                if (sign) {
                    if (position.x < columns && position.y < rows)   step = {x: 1, y: 0};
                    if (position.x == columns && position.y < rows)   step = {x: 0, y: 1};
                } else {
                    if (position.x > start.x && position.y > start.y) step = {x: -1, y: 0};
                    if (position.x == start.x && position.y > start.y)   step = {x: 0, y: -1};
                }

                if (circles >= 6*(options._matrix.columns * options._matrix.rows)) return;
                snakeInterval(pins, options, step, position, sign, interval, circles, start);
            };

			var intervalious = function(pins, options) {
				var inter = 0;
				for (var y in pins) {
					for (var x in pins[y]) {
						setTimeout((function(y,x){ return function() {
							effect(pins[y][x]);
						}})(y,x), inter);
						inter+= options.interval;
					}
				}
			};


			var intervaliousRnd = function(pins, options) {
				var	inter = 0,
					z = 0;

					while (z < options.matrix.rows * options.matrix.columns) {
						setTimeout((function(y,x){ return function() {
							effect(pins[y][x]);
						}})(parseInt(Math.floor(Math.random() * (options.matrix.rows))),parseInt(Math.floor(Math.random() * (options.matrix.columns)))), inter);

						inter+= options.interval;
						z++;
					}
			};

			var effect = function(pin) {
				pin
					.css({
						//background: "#"+((1<<24)*Math.random()|0).toString(16)
					})
					.animate({
						opacity: pin.data('sign') ? 1 : 0 //0.3
					}, 0)//parseInt((Math.random() * (200-50) + 50)))
					.data('sign', pin.data('sign') ? false : true);

                /*pin.css({opacity: pin.data('sign') ? 1 : 0})
                    .data('sign', pin.data('sign') ? false : true);*/
			};

			return function()
			{
                var options = {
                    callbacks: {
                        effect: effect
                    },
                    interval: this.options.spinnerDOM.interval,
                    matrix:   JSON.parse(JSON.stringify({
                        x: this.options.spinnerDOM.matrix.columns - 1,
                        y: this.options.spinnerDOM.matrix.rows - 1
                    })),
                    _matrix: this.options.spinnerDOM.matrix
                }

                var pins = this._pins;

//				intervalious(pins, options);
                snakeInterval(pins, options);
				/*this._interval = setInterval(function() {
                    intervalious(pins, options);
                }, options.matrix.columns * options.matrix.rows * options.interval);*/
			}
		})(),

		run: function()
		{
			this._background = this.background();
			this._spinner    = this.spinnerDOM();

			this.target.append(this._background.append(this._spinner));

			this.runInterval();
		},

		stop: function()
		{

		}
	});

	$.fn.loading = function(options) {
		var loading = new Loading(this, options);

		loading.run();

		this.data({loading: loading});
	}

})(jQuery);