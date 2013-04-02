/**
 * jQuery Loading Plugin - Shows loading progress animation, flexible and pretty =).
 *
 * Version: 0.2.1
 * Date: 2013-04-03 00:09:34
 *
 * Copyright 2013, Sergey Kamardin.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
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
    /**
     * Class definition.
     *
     * @param element
     * @param options
     * @constructor
     */
    var Loading = (function() {

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
                    i = parseInt(Math.floor(Math.random() * (max + 1)));

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
         * @param name
         *
         * @throws {Error}
         *
         * @returns {Function}
         */
        var algorithmResolver = function(name) {
            if (typeof name == 'function') {
                return name;
            }

            if (Loading.algorithm.hasOwnProperty(name)) {
                return Loading.algorithm[name];
            } else {
                throw new Error('Algorithm not found: "' + name + '"');
            }
        };

        /**
         * Resolves which function to use as effect.
         *
         * @private
         *
         * @param name
         *
         * @throws {Error}
         *
         * @returns {Function}
         */
        var effectResolver = function(name) {
            if (typeof name == 'function') {
                return name;
            }

            if (name instanceof Array) {
                var effects;
                for (var x = name.length - 1; x >= 0; x--) {
                    effects = (function(effect, x, effects) {
                        return function() {
                            effect.apply(null, arguments);
                            if (effects) {
                                effects.apply(null, arguments);
                            }
                        };
                    })(effectResolver(name[x]), x, effects);
                }

                effects.count = name.length;

                return effects;

            } else {
                if (Loading.effect.hasOwnProperty(name)) {
                    var effect = Loading.effect[name];
                    effect.count = 1;
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
         * @returns {*}
         */
        var optionsNormalizer = function(options) {
            var	spinner = options.spinner,
                matrix  = options.spinner.matrix,
                pin     = options.spinner.pin,
                answer  = $.extend({}, options);

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

            var css = {
                position: 'absolute',
                opacity: options.opacity
            };

            $.extend(css, dimensions);

            css.background = options.img
                ? options.color + ' url('+options.img+') ' + options.position
                : options.color;

            options.borderRadius && (css['border-radius'] = options.borderRadius);

            background.css(css);

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

            pin
                .css({
                    position:   'absolute',
                    width:      options.width,
                    height:     options.height,
                    top:        position.y * (options.height +options.margin.top + options.margin.bottom),
                    left:       position.x * (options.width +options.margin.left + options.margin.right)
                })
                .attr({
                    'class': 'loading-pin'
                })

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
        return function(element, options) {
            options || (options = {});

            this.target  = element;
            this.id      = uniqueId(50);
            this.options = optionsNormalizer($.extend({}, $.fn.loading.defaults, options, true));

            this.dimensions = {
                top:    this.target.offset().top,
                left:   this.target.offset().left,
                width:  this.target.outerWidth(),
                height: this.target.outerHeight()
            };

            this.pins       = createPins(this.options.spinner);

            this.background = createBackground(this.options.background, this.dimensions);
            this.spinner    = createSpinner(this.options.spinner, this.dimensions, this.pins);

            this.algorithm = algorithmResolver(this.options.algorithm);
            this.effect    = effectResolver(this.options.effect);

            this.counter   = 0;

            this.initialize(options);
        };
    })();

    Loading.prototype = {
        constructor: Loading,

        /**
         * Initializes parameters.
         * Can be called in a runtime.
         *
         * @param options
         */
        initialize: function(options) {
            options || (options = {});

            if (options.progress) {
                this.progress = options.progress;
            }
        },

        /**
         * Shows loading element.
         */
        show: function() {
            this.background.append(this.spinner).appendTo(this.target);
        },

        /**
         * Starts animation.
         */
        start: function()
        {
            var matrix        = {x: this.options.spinner.matrix.x, y: this.options.spinner.matrix.y},
                interval      = Math.max(this.options.spinner.interval/this.effect.count, 0),
                pins          = this.pins,
                algorithmData = null,
                algorithm     = this.algorithm,
                effect        = this.effect,
                loading       = this;

            this.interval = setInterval(function() {

                algorithmData = algorithm(matrix, algorithmData);
                effect(pins[algorithmData.x][algorithmData.y], interval);

                loading.counter++;

                if (loading.progress >= 100) loading.stop();
            }, interval);
        },

        /**
         * Stops animation.
         */
        stop: function()
        {
            clearInterval(this.interval);
        }
    };

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
        if (!this.data('loading')) {
            var loading = new Loading(this, options);
            this.data({loading: loading});

            loading.show();
            loading.start();
        } else {
            var loading = this.data('loading');

            loading.initialize(options);
        }
    };

    /**
     * Gives an ability for adding custom algorithms.
     *
     * @param {String} name
     * @param {Function} algorithm
     */
    $.fn.loading.algorithm = function(name, algorithm) {
        Loading.algorithm[name] = algorithm;
    };

    /**
     * Gives an ability for adding custom effects.
     *
     * @param {String} name
     * @param {Function} effect
     */
    $.fn.loading.effect = function(name, effect) {
        Loading.effect[name] = effect;
    };

})(jQuery);


(function($) {
    $.fn.loading.defaults = {
        opacity:    0.9,
        speedIn:    300,
        speedOut:   1000,

        progress: 0,

        algorithm: 'snake',
        effect:    ['simple'],

        spinner: {
            width:   35,
            height:  35,
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
            interval: 100
        },

        background: {
            color:        'white',
            opacity:      0.8,
            position:     '',
            img:          null,
            borderRadius: 1
        }
    };
})(jQuery);



(function($) {
    $.fn.loading.algorithm('linear', function(matrix, _) {

    });
}).call(this, jQuery);




(function($) {
    $.fn.loading.algorithm('random', function(options, _) {
        /*var	inter = 0,
            z = 0;

        while (z < options.matrix.y * options.matrix.x) {
            setTimeout(
                (function(y,x){
                    return function() {
                        effect(pins[y][x]);
                    };
                })(parseInt(Math.floor(Math.random() * (options.matrix.y)), 10),parseInt(Math.floor(Math.random() * (options.matrix.x)), 10)), inter);

            inter+= options.interval;
            z++;
        }*/
    });
}).call(this, jQuery);


(function($) {
    $.fn.loading.algorithm('snake', (function()
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
        };

        var reset = function(matrix) {
            var _ = {
                x: 0,
                y: 0,

                axis: 'x',
                sign: 1,
                matrix: {
                    x: [0, matrix.x],
                    y: [0, matrix.y]
                },
                path: 0,
                reversed: -1
            };

            _.fullPath = countPath(_);

            return _;
        }

        return function(matrix, _) {

            if (!_) {
                _ = reset(matrix);

                _.path++;
                return _;
            }

            if (_.path == _.fullPath) {
                if (!moveMatrix(_, _.reversed)) {
                    reverse(_);
                    _.path = 0;

                    //_ = reset(matrix);
                    _.path++;
                    return _;
                }

                _.path = 0;
                _.fullPath = countPath(_);
            }

            var resolved = resolvePath(_);

            if (resolved) {
                _.x    = resolved.x;
                _.y    = resolved.y;
                _.axis = resolved.axis;
                _.sign = resolved.sign;

                _.path++;
                return _;
            } else {
                throw new Error('Cant resolve path');
            }
        };

    })());

}).call(this, jQuery);


(function($) {
    $.fn.loading.effect('fancy', function(pin, interval) {
        pin
            .css({
                background: "#"+((1<<24)*Math.random()|0).toString(16)
            })
            .animate({width: '-=2', height: '-=2', top: '+=1', left: '+=1'}, interval/2)
            .animate({width: '+=2', height: '+=2', top: '-=1', left: '-=1'}, interval/2)
    });
}).call(this, jQuery);


(function($) {
    $.fn.loading.effect('jump', function(pin, interval) {
        var rnd = Math.floor(Math.random() * 7 + 1);
        pin
            .animate({top: '-=' + rnd}, interval/3 * 2)
            .animate({top: '+=' + rnd}, interval/3)
    });
}).call(this, jQuery);


(function($) {
    $.fn.loading.effect('simple', function(pin, interval, callback) {
        if (!pin.data('simple-init')) {
            pin
                .css({
                    background: 'green',
                    opacity: 0
                })
                .data('simple-init', true)
        }

        pin
            .data('simple-sign', pin.data('simple-sign') ? false : true)
            .animate({
                opacity: pin.data('simple-sign') ? 1 : 0
            }, interval);
    });
}).call(this, jQuery);