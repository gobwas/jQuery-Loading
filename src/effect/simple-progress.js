(function($) {
    "use strict";

	var defaults = {

	};

    $.fn.loading.effect('simple-progress', function(pin, interval, runtime) {
        if (!pin.data('simple-progress-init')) {
            pin
                .css({
                    background: 'green',
                    opacity: runtime.progress/100
                })
                .data('simple-progress-init', true);
        }

        pin
            .data('simple-progress-sign', pin.data('simple-progress-sign') ? false : true)
            .animate({
                opacity: pin.data('simple-progress-sign') ? 1 : runtime.progress/100
            }, interval);
    }, defaults);
}).call(this, jQuery);