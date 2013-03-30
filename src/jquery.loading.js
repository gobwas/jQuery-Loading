/**
 * jquery.loading - plugin that creates pretty loading spinners for ur elements.
 *
 * Version: 0.1.4-dev
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
				width:   90,
				height:  40,
				matrix: {
					x: null,
					y: null
				},
				pin: {
					width:  7,
					height: 7,
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

				if (!config.matrix.x || !config.matrix.y) {
					config.matrix.x = Math.floor(config.width / (config.pin.width + config.pin.margin.left + config.pin.margin.right));
					config.matrix.y = Math.floor(config.height / (config.pin.height + config.pin.margin.top + config.pin.margin.bottom));
				} else {
					config.pin.width = Math.floor((config.width - ((config.pin.margin.right + config.pin.margin.left) * config.matrix.x)) / config.matrix.x);
					config.pin.height = Math.floor((config.height - ((config.pin.margin.top + config.pin.margin.bottom) * config.matrix.y)) / config.matrix.y);
				}

                config.matrix.x-= 1;
                config.matrix.y-= 1;

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

				for (var y = 0; y <= config.matrix.y; y++) {
					for (var x = 0; x <= config.matrix.x; x++) {
                        pins[x] || (pins[x] = {});
						pins[x][y] = $('<div/>')
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



            var snakeInterval = (function()
            {
                var axisReverse = function (axis) {
                  return axis == 'x' ? 'y' : 'x';
                };

                var checkIsInMatrix = function(x, y, _) {
                    var okay = true;

                    okay = okay && (_.matrix.x[0] <= x && x <= _.matrix.x[1]);
                    okay = okay && (_.matrix.y[0] <= y && y <= _.matrix.y[1]);

                    return okay;
                };

                var Path = function(_, reverseAxis, reverseSign, zeroMove) {
                    this.x = _.x;
                    this.y = _.y;
                    this.axis = reverseAxis ? axisReverse(_.axis) : _.axis;
                    this.sign = reverseSign ? -1 * _.sign : _.sign;

                    if (!zeroMove) {
                        this[this.axis]+= this.sign;
                    }
                };

                // todo refactor as hash
                var resolvers = [
                    function(_) {
                        var path = new Path(_, false, false);
                        return checkIsInMatrix(path.x, path.y, _) ? path : false;
                    },
                    function(_) {
                        var path = new Path(_, true, true);
                        return checkIsInMatrix(path.x, path.y, _) ? path : false;
                    },
                    function(_) {
                        var path = new Path(_, true, false);
                        return checkIsInMatrix(path.x, path.y, _) ? path : false;
                    },
                    function(_) {
                        var path = new Path(_, false, true, true);
                        return checkIsInMatrix(path.x, path.y, _) ? path : false;
                    }
                ];

                var resolvePath = function(_) {
                    var path;

                    for (var x = 0; x < resolvers.length; x++) {
                        path = resolvers[x](_);
                        if (path instanceof Path) {
                            return path;
                        }
                    }

                    return false;
                };

                var likeStart = function(path, _) {
                    return path.x == _.start.x && path.y == _.start.y;
                };

                var moveMatrix = function(_, sign) {
                    var x = [_.matrix.x[0] - sign, _.matrix.x[1] + sign],
                        y = [_.matrix.y[0] - sign, _.matrix.y[1] + sign];

                    if ((0 <= x[0] && x[0] <= x[1]) && (0 <= y[0] && y[0] <= y[1])) {
                        _.matrix.x = x;
                        _.matrix.y = y;

                        return true;
                    }

                    return false;
                };

                var moveStart = function(_, sign) {
                    var x,y;

                    if (sign) {
                        x = _.start.x - sign;
                        y = _.start.y - sign;
                    } else {
                        x=  _.x;
                        y = _.y;
                    }

                    if (checkIsInMatrix(x,y,_)) {
                        _.start.x = x;
                        _.start.y = y;

                        return true;
                    }

                    return false;
                };

                var countPath = function(_) {
                    var x = _.matrix.x[1] - _.matrix.x[0],
                        y = _.matrix.y[1] - _.matrix.y[0],
                        len;

                    if (x == 0 && y == 0) {
                        return 1;
                    } else if (x == 0) {
                        len = y + 1;
                    } else if (y == 0) {
                        len = x + 1;
                    } else {
                        len = 2 * (x + y)
                    }

                    return len;
                };

                var reverse = function(_) {
                    _.sign *= -1;
                    _.reversed *= -1;
                }

                return function(pins, options, _) {

                    if (!_) {
                        _ = {
                            axis: 'x',
                            sign: 1,
                            x: 0,
                            y: 0,
                            matrix: {
                                x: [0, options.matrix.x],
                                y: [0, options.matrix.y]
                            },
                            start: {
                                x: 0,
                                y: 0
                            },
                            interval: 0,
                            counter: 0,
                            path: 0,
                            reversed: -1
                        };

                        _.fullPath = countPath(_);
                    }

                    var pin = pins[_.x][_.y];

                    setTimeout(function() {
                        effect(pin);
                    }, _.interval)

                    _.counter++;
                    _.path++;
                    _.interval+= options.interval;

                    if (_.counter >= 12 * (options.matrix.x + 1) * (options.matrix.y + 1)) return;

                    // for debug
                    //effect(pins[_.x][_.y]);


                    if (_.path == _.fullPath) {
                        if (!moveMatrix(_, _.reversed)) {
                            reverse(_);
                            _.path = 0;
                            return snakeInterval(pins, options, _);
                        }

                        _.path = 0;
                        _.fullPath = countPath(_);
                    }

                    var resolved = resolvePath(_);


                    /*if (likeStart(resolved, _)) {
                        var reverseSign = _.reversed ? 1 : -1;

                        if (!moveMatrix(_, reverseSign)) {
                            reverse(_);
                            moveStart(_);
                            return snakeInterval(pins, options, _)
                        } else {
                            moveStart(_, reverseSign);
                            resolved = resolvePath(_);
                        }
                    }*/

                    if (resolved) {
                        _.x    = resolved.x;
                        _.y    = resolved.y;
                        _.axis = resolved.axis;
                        _.sign = resolved.sign;

                        snakeInterval(pins, options, _);
                    } else {
                        throw new Error('Cant resolve path');
                    }


                };


            })();









/*if (_.loop > 100) return;

snakeInterval(pins, options, _);
return;






                if (!algorithm) {
                    algorithm = {
                        start:    {x: 0, y: 0},
                        step:     {x: 0, y: 0},
                        position: {x: 0, y: 0},
                        axis:     'x',
                        way:      options.matrix.x,
                        interval: 0,
                        circles:  0
                    }
                }

                *//*setTimeout((function(pin){ return function() {
                 effect(pin);
                 }})(pins[algorithm.position.y][algorithm.position.x]), algorithm.interval);*//*

                effect(pins[algorithm.position.y][algorithm.position.x]);

                algorithm.position.x+= step.x;
                algorithm.position.y+= step.y;
                algorithm.interval+= options.interval;

                if (position.x == start.x && position.y == start.y && circles != 0) {
                    algorithm.position.x++;
                    algorithm.position.y++;
                    algorithm.start.x++;
                    algorithm.start.y++;
                    options.matrix.x--;
                    options.matrix.y--;
                }

                if ((options.matrix.x - start.x) <= 0 || (options.matrix.y - start.y) <= 0) {
                    position = {x: 0, y: 0};
                    start = {x: 0, y: 0};
                    options.matrix = JSON.parse(JSON.stringify({
                        x: options._matrix.x - 1,
                        y: options._matrix.y - 1
                    }));
                }

                circles++;

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

                if (circles >= 6*(options._matrix.x * options._matrix.y)) return;
                snakeInterval(pins, options, step, position, sign, interval, circles, start);
            };*/

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

					while (z < options.matrix.y * options.matrix.x) {
						setTimeout((function(y,x){ return function() {
							effect(pins[y][x]);
						}})(parseInt(Math.floor(Math.random() * (options.matrix.y))),parseInt(Math.floor(Math.random() * (options.matrix.x)))), inter);

						inter+= options.interval;
						z++;
					}
			};

			var effect = function(pin) {
				pin
					.css({
						background: "#"+((1<<24)*Math.random()|0).toString(16)
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
                    matrix:   this.options.spinnerDOM.matrix
                }

                var pins = this._pins;

//				intervalious(pins, options);
                snakeInterval(pins, options);
				/*this._interval = setInterval(function() {
                    intervalious(pins, options);
                }, options.matrix.x * options.matrix.y * options.interval);*/
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