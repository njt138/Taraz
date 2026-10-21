// Tarāz in-browser test runner page script
(function () {
  'use strict';

  async function runSuite() {
    var T = window.Taraz;
    if (!T || !T.tests) {
      console.error('[Taraz Test Runner] Taraz namespace not found');
      return;
    }
    var list = T.tests();
    var elTotal = document.getElementById('s-total');
    var elPass = document.getElementById('s-pass');
    var elFail = document.getElementById('s-fail');
    var elList = document.getElementById('test-list');
    var elTime = document.getElementById('tz-run-time');

    if (elTotal) elTotal.textContent = String(list.length);
    var passed = 0, failed = 0;
    var errors = [];
    var t0 = performance.now();

    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      var item = document.createElement('div');
      item.className = 'tz-test-item';
      var left = document.createElement('div');
      var grp = document.createElement('span');
      grp.className = 'tz-test-group';
      grp.textContent = '[' + (t.group || 'engine') + ']';
      var name = document.createElement('span');
      name.textContent = t.name;
      left.appendChild(grp);
      left.appendChild(name);

      var right = document.createElement('span');
      right.className = 'tz-test-status';
      item.appendChild(left);
      item.appendChild(right);
      if (elList) elList.appendChild(item);

      var res = false;
      var err = null;
      try {
        if (t.input !== undefined) {
          var eng = T.get('engine');
          var r = eng ? eng.process(t.input, t.settings || {}) : null;
          res = t.expect ? t.expect(r) : true;
        } else {
          var fn = t.run || t.expect || t.fn;
          res = fn ? await fn() : true;
        }
      } catch (e) {
        res = false;
        err = e && (e.stack || e.message) ? e.message : String(e);
      }

      if (res === true) {
        passed++;
        item.classList.add('pass');
        right.textContent = '✓ PASS';
        right.style.color = '#009E73';
      } else {
        failed++;
        item.classList.add('fail');
        right.textContent = '✗ FAIL';
        right.style.color = '#D55E00';
        var errBox = document.createElement('div');
        errBox.className = 'tz-test-error';
        errBox.textContent = err || (typeof res === 'string' ? res : 'Assertion returned ' + JSON.stringify(res));
        left.appendChild(errBox);
        errors.push({ id: t.id || t.name, name: t.name, group: t.group, error: errBox.textContent });
      }
      if (elPass) elPass.textContent = String(passed);
      if (elFail) elFail.textContent = String(failed);
    }

    var dt = Math.round(performance.now() - t0);
    if (elTime) elTime.textContent = 'پایان در ' + dt + ' میلی‌ثانیه';
    window.__testSummary = { total: list.length, passed: passed, failed: failed, durationMs: dt, errors: errors };
  }

  if (document.readyState === 'complete') {
    setTimeout(runSuite, 100);
  } else {
    window.addEventListener('load', function () {
      setTimeout(runSuite, 100);
    });
  }
})();
