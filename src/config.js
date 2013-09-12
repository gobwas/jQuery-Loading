(function($) {
	"use strict";

	$.fn.loading.defaults = {
		//opacity:    0.9,

		algorithm: {
			name: 'snake',
			options: {
				reverse: false
			}
		},

		effect: ['simple'],

		spinner: {
			width:   "50%",
			height:  "30%",
			matrix: {
				x: null,
				y: null
			},
			pin: {
				width:  5,
				height: 5,
				margin: {
					top:    1,
					right:  1,
					bottom: 0,
					left:   0
				},
				css: {
					background: "green",
					opacity: 0
				}
			},
			interval: 100
		},

		background: {
			//color:        'white',
			//img:          null,
			//borderRadius: 1,
			// raw css
			css: {
				opacity: 0.8,
				"z-index": 9999,
				overflow: "hidden"
			}
		}
	};
})(jQuery);
