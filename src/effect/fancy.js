(function($) {
    "use strict";

	var defaults = {

	};

    $.fn.loading.effect('fancy', function(pin, interval, runtime) {
        pin
            .css({
                background: "#"+((1<<24)*Math.random()|0).toString(16)
            })
            .animate({width: '-=2', height: '-=2', top: '+=1', left: '+=1'}, interval/2)
            .animate({width: '+=2', height: '+=2', top: '-=1', left: '-=1'}, interval/2);
    }, defaults);
}).call(this, jQuery);