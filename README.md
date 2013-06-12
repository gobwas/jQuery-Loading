jQuery Loading Plugin
=====================

This is a simple jQuery loading plugin, that draws animations via DOM elements,
with ability to push your own effects&algorithms for animations.

It also have predefined algorithms and effects.

Usage
=====

```javascript

// initialize loader with options:
// options are listed in wiki
$('#my-element').loading(options);

// update runtime options of loading:
// progress >= 100 will delete loader;
// interval - u can change the speed of the current animation
$('#my-element').loading({progress: 50, interval: 100});

```

Algorithms
----------

 + Snake


Effects
-------

 + Simple show/hide
 + Simple show/hide depends on progress
 + Fancy color changing
 + Jumping

Creating your own animations
============================

Creating your own algorithm
---------------------------

n/a

Creating your own effect
------------------------

n/a