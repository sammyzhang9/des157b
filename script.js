(function() {
    'use strict';

    const button = document.getElementById('switch');
    const body = document.body;
    const menuGroups = document.querySelectorAll('.menu-group');

    button.addEventListener('click', function() {
        const isLight = body.classList.toggle('switch');

        button.classList.toggle('switch', isLight);

        for (const group of menuGroups) {
            group.classList.toggle('switch', isLight);
        }
    });
})();
