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
