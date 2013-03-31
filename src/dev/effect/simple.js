(function($) {
    $.fn.loading.effect('simple', function(pin, interval, callback) {
        pin
            .data('simple-sign', pin.data('simple-sign') ? false : true)
            .css({background: 'blue'})
            .animate({
                opacity: pin.data('simple-sign') ? 1 : 0
            }, interval);
    });
}).call(this, jQuery);