/**
 * GAIA 术语词典 - 悬浮/点击浮现释义
 * 为页面中的术语添加下划线，悬停或点击时在右下角显示大块释义面板
 */
(function () {
  if (typeof GAIA_GLOSSARY === 'undefined') return;
  const terms = Object.keys(GAIA_GLOSSARY).sort((a, b) => b.length - a.length);
  const article = document.querySelector('.manual, .doc-content');
  if (!article) return;

  // 创建固定在右下角的释义面板
  const popover = document.createElement('div');
  popover.className = 'glossary-popover';
  popover.setAttribute('aria-hidden', 'true');
  document.body.appendChild(popover);

  function showPopover(termEl) {
    const tip = termEl.getAttribute('data-tip');
    if (!tip) return;
    popover.textContent = tip;
    popover.classList.add('visible');
    popover.setAttribute('aria-hidden', 'false');
    // 定位到词条右下方向，紧贴词条
    const rect = termEl.getBoundingClientRect();
    const gap = 6;
    let left = rect.left;
    let top = rect.bottom + gap;
    // 避免超出视口右边界
    const maxW = Math.min(420, window.innerWidth - 32);
    popover.style.width = maxW + 'px';
    if (left + maxW > window.innerWidth - 16) left = Math.max(16, window.innerWidth - maxW - 16);
    if (left < 16) left = 16;
    // 避免超出视口下边界，则改为显示在词条上方
    const maxH = Math.min(360, window.innerHeight * 0.6);
    if (top + maxH > window.innerHeight - 16) top = rect.top - maxH - gap;
    if (top < 16) top = 16;
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
    popover.style.right = 'auto';
    popover.style.bottom = 'auto';
  }

  function hidePopover() {
    popover.classList.remove('visible');
    popover.setAttribute('aria-hidden', 'true');
  }

  function wrapTextNode(textNode) {
    const text = textNode.textContent;
    if (!terms.some(t => text.includes(t))) return;
    const re = new RegExp(terms.map(t => escapeRegex(t)).join('|'), 'g');
    const span = document.createElement('span');
    span.innerHTML = text.replace(re, (match) =>
      `<span class="glossary-term" data-tip="${escapeAttr(GAIA_GLOSSARY[match])}" tabindex="0" role="button">${escapeHtml(match)}</span>`
    );
    textNode.parentNode.replaceChild(span, textNode);
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (n.parentElement && /^(SCRIPT|STYLE|CODE|PRE)$/i.test(n.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
      if (n.textContent.trim().length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const toProcess = [];
  let n;
  while (n = walker.nextNode()) toProcess.push(n);
  toProcess.forEach(wrapTextNode);

  // 悬浮显示
  document.addEventListener('mouseover', (e) => {
    const term = e.target.closest('.glossary-term');
    if (!term) {
      hidePopover();
      return;
    }
    showPopover(term);
  });
  document.addEventListener('mouseout', (e) => {
    const term = e.target.closest('.glossary-term');
    if (!term || !popover.contains(e.relatedTarget) && !e.relatedTarget?.closest?.('.glossary-popover')) {
      if (!document.querySelector('.glossary-term.active')) hidePopover();
    }
  });

  // 点击切换固定显示
  document.addEventListener('click', (e) => {
    const term = e.target.closest('.glossary-term');
    if (!term) {
      document.querySelectorAll('.glossary-term.active').forEach(el => el.classList.remove('active'));
      hidePopover();
      return;
    }
    term.classList.toggle('active');
    document.querySelectorAll('.glossary-term.active').forEach(el => {
      if (el !== term) el.classList.remove('active');
    });
    if (term.classList.contains('active')) {
      showPopover(term);
    } else {
      hidePopover();
    }
  });

  // 点击面板外部关闭
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.glossary-term') && !e.target.closest('.glossary-popover')) {
      document.querySelectorAll('.glossary-term.active').forEach(el => el.classList.remove('active'));
      hidePopover();
    }
  });
})();
