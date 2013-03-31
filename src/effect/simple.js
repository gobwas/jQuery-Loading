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