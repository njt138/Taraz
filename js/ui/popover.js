// Tarāz popover system: collision-aware, body-level menus and custom selects.
(function (T) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var active = [];

  function checkSvg() {
    var v = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    v.setAttribute('viewBox', '0 0 20 20'); v.setAttribute('width', '14'); v.setAttribute('height', '14');
    v.setAttribute('fill', 'none'); v.setAttribute('stroke', 'currentColor');
    v.setAttribute('stroke-width', '1.5'); v.setAttribute('stroke-linecap', 'round');
    v.setAttribute('stroke-linejoin', 'round'); v.setAttribute('aria-hidden', 'true');
    p.setAttribute('d', 'M4 10l4 4 8-9'); v.appendChild(p); return v;
  }

  function chevSvg() {
    var v = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    v.setAttribute('viewBox', '0 0 20 20'); v.setAttribute('width', '12'); v.setAttribute('height', '12');
    v.setAttribute('fill', 'none'); v.setAttribute('stroke', 'currentColor');
    v.setAttribute('stroke-width', '1.5'); v.setAttribute('stroke-linecap', 'round');
    v.setAttribute('stroke-linejoin', 'round'); v.setAttribute('aria-hidden', 'true');
    p.setAttribute('d', 'M6 8l4 4 4-4'); v.appendChild(p); return v;
  }

  /** Position a popover relative to an anchor rect, flip if needed. */
  function positionPopover(pop, anchorRect, preferDir) {
    var W = window.innerWidth, H = window.innerHeight;
    var pw = pop.offsetWidth || 240, ph = pop.offsetHeight || 80;
    var gap = 6, margin = 8;

    var dir = preferDir || 'down';
    var spaceBelow = H - anchorRect.bottom - gap;
    var spaceAbove = anchorRect.top - gap;
    if (dir === 'down' && spaceBelow < ph + margin && spaceAbove > spaceBelow) dir = 'up';
    else if (dir === 'up' && spaceAbove < ph + margin && spaceBelow > spaceAbove) dir = 'down';

    pop.setAttribute('data-dir', dir);

    var top, left;
    if (dir === 'up') {
      top = anchorRect.top - ph - gap;
    } else {
      top = anchorRect.bottom + gap;
    }

    var rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    if (rtl) {
      left = anchorRect.right - pw;
    } else {
      left = anchorRect.left;
    }
    left = Math.max(margin, Math.min(left, W - pw - margin));
    top = Math.max(margin, Math.min(top, H - ph - margin));

    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  /** Close a single popover entry. */
  function closeOne(entry) {
    var idx = active.indexOf(entry);
    if (idx < 0) return;
    active.splice(idx, 1);
    var pop = entry.pop;
    pop.classList.add('out');
    setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 160);
    if (entry.trigger) {
      entry.trigger.setAttribute('aria-expanded', 'false');
    }
    if (typeof entry.onClose === 'function') entry.onClose();
  }

  /** Close all open popovers. */
  function closeAll() {
    active.slice().forEach(closeOne);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active.length) {
      var last = active[active.length - 1];
      closeOne(last);
      if (last.trigger) last.trigger.focus();
      e.preventDefault();
    }
  });

  document.addEventListener('click', function (e) {
    active.slice().forEach(function (entry) {
      if (!entry.pop.contains(e.target) && (!entry.trigger || !entry.trigger.contains(e.target))) {
        closeOne(entry);
      }
    });
  }, true);

  window.addEventListener('resize', closeAll);
  window.addEventListener('scroll', function (e) {
    active.slice().forEach(function (entry) {
      if (!entry.pop.contains(e.target)) closeOne(entry);
    });
  }, true);

  /**
   * Open a popover attached to a trigger.
   * @param {object} opts
   *   trigger    – the button element
   *   items      – array of {label, role:'menuitem'|'option', checked, onSelect, sep(bool)}
   *   role       – 'menu' | 'listbox'
   *   onClose    – callback
   *   preferDir  – 'up' | 'down'
   */
  function open(opts) {
    closeAll();
    var trigger = opts.trigger, items = opts.items || [], role = opts.role || 'menu';
    var pop = document.createElement('div');
    pop.className = 'tz-popover';
    pop.setAttribute('role', role);
    pop.setAttribute('tabindex', '-1');

    var focusIdx = 0;
    var itemEls = [];

    items.forEach(function (item, idx) {
      if (item.sep) {
        var sep = document.createElement('div');
        sep.className = 'tz-popover-sep';
        pop.appendChild(sep);
        return;
      }
      var itemRole = item.role || (role === 'listbox' ? 'option' : 'menuitem');
      var el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('role', itemRole);
      if (item.checked) el.setAttribute('aria-selected', 'true');
      if (item.disabled) { el.disabled = true; el.setAttribute('aria-disabled', 'true'); }

      var chk = document.createElement('span');
      chk.className = 'tz-popover-check';
      chk.setAttribute('aria-hidden', 'true');
      chk.appendChild(checkSvg());

      var lbl = document.createElement('span');
      lbl.textContent = item.label;

      el.appendChild(chk);
      el.appendChild(lbl);

      el.addEventListener('click', function () {
        if (typeof item.onSelect === 'function') item.onSelect();
        closeOne(entry);
        if (trigger) trigger.focus();
      });
      pop.appendChild(el);
      itemEls.push(el);
    });

    document.body.appendChild(pop);

    var anchorRect = trigger ? trigger.getBoundingClientRect() : { top: 100, bottom: 120, left: 100, right: 200 };
    positionPopover(pop, anchorRect, opts.preferDir);

    if (trigger) trigger.setAttribute('aria-expanded', 'true');

    var entry = { pop: pop, trigger: trigger, onClose: opts.onClose };
    active.push(entry);

    function moveFocus(delta) {
      var els = itemEls.filter(function (e) { return !e.disabled; });
      if (!els.length) return;
      focusIdx = (focusIdx + delta + els.length) % els.length;
      els[focusIdx].focus();
    }

    pop.addEventListener('keydown', function (e) {
      var rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      var down = rtl ? 'ArrowLeft' : 'ArrowDown', up = rtl ? 'ArrowRight' : 'ArrowUp';
      if (e.key === down || e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
      else if (e.key === up || e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
      else if (e.key === 'Home') { e.preventDefault(); focusIdx = 0; moveFocus(0); }
      else if (e.key === 'End') { e.preventDefault(); focusIdx = itemEls.length - 1; moveFocus(0); }
    });

    setTimeout(function () {
      var first = itemEls[0]; if (first) first.focus();
    }, 20);

    return entry;
  }

  /**
   * Build and manage a custom <select> replacement.
   * @param {object} opts
   *   container  – element to append button into
   *   options    – [{v, label}]
   *   getValue   – function returning current value
   *   setValue   – function(v)
   *   ariaLabel  – accessible name
   */
  function makeSelect(opts) {
    var h = T.h;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tz-select-btn';
    btn.setAttribute('role', 'combobox');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);

    var valSpan = document.createElement('span');
    valSpan.className = 'tz-sel-val';
    var chevSpan = document.createElement('span');
    chevSpan.className = 'tz-sel-chev';
    chevSpan.appendChild(chevSvg());
    btn.appendChild(valSpan);
    btn.appendChild(chevSpan);

    function sync() {
      var cur = opts.getValue();
      var found = (opts.options || []).filter(function (o) { return o.v === cur; })[0];
      valSpan.textContent = found ? found.label : (cur != null ? String(cur) : '');
    }
    sync();

    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { closeAll(); return; }
      var cur = opts.getValue();
      open({
        trigger: btn,
        role: 'listbox',
        preferDir: 'down',
        items: (opts.options || []).map(function (o) {
          return {
            label: o.label,
            role: 'option',
            checked: o.v === cur,
            onSelect: function () {
              opts.setValue(o.v);
              sync();
            }
          };
        }),
        onClose: sync
      });
    });

    if (opts.container) opts.container.appendChild(btn);
    return { el: btn, sync: sync };
  }

  T.popover = { open: open, closeAll: closeAll, makeSelect: makeSelect };
})(window.Taraz = window.Taraz || {});
