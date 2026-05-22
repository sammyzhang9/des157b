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

//starry sky canvas
const canvas = document.getElementById('starryCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
const starCount = 400;

for (let i = 0; i < starCount; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1 + 0.5,
    alpha: Math.random(),
    delta: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? -1 : 1)
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.shadowBlur = 2;
    ctx.shadowColor = '#bb86fc';
    ctx.fill();

    star.alpha += star.delta;
    if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;
  }

  requestAnimationFrame(draw);
}

draw();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
