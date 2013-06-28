(function($) {
    "use strict";

	var defaults = {

	};

    $.fn.loading.effect('simple', function(pin, interval, runtime) {
        pin
            .data('simple-sign', pin.data('simple-sign') ? false : true)
            .animate({
                opacity: pin.data('simple-sign') ? 1 : 0
            }, interval);
    }, defaults);

}).call(this, jQuery);