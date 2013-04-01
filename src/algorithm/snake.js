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