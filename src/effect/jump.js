(function($) {
    "use strict";

    $.fn.loading.effect('jump', function(pin, interval, runtime) {
        var rnd = Math.floor(Math.random() * 7 + 1);
        pin
            .animate({top: '-=' + rnd}, interval/3 * 2)
            .animate({top: '+=' + rnd}, interval/3);
    });
}).call(this, jQuery);