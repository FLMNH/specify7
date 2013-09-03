define(['navigation'], function(navigation) {
    "use strict";

    return {
        title: 'Attachments',
        icon: '/images/attach_pref.png',
        execute: function() {
            navigation.go('/specify/attachments/');
        }
    };
});