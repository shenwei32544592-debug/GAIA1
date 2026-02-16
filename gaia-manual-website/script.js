/**
 * GAIA 说明书网站 · 交互脚本
 * 导航高亮、平滑滚动
 */

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.manual h2[id], .manual h3[id]');

  // 点击导航时高亮当前项
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // 滚动时根据可视区域高亮对应导航
  const observerOptions = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, observerOptions);

  sections.forEach(s => observer.observe(s));
});
