/*
 * Rewards panel client logic.
 * Source parity: _reference/repo/app/routes/account.rewards.tsx
 *
 *  - Fetches paginated activity feed from Upzelo on first panel reveal.
 *  - Click-to-copy for active reward codes.
 *  - Panel is hidden by default; fetch is lazy (only when the panel becomes visible).
 */
(function () {
  const panel = document.querySelector('[data-customer-rewards]');
  if (!panel) return;

  const customerId = panel.dataset.customerId;
  const appId = panel.dataset.upzeloAppId;
  const appUrl = (panel.dataset.upzeloAppUrl || 'https://app.upzelo.com/api').replace(/\/$/, '');

  /* ---------- Click-to-copy for active reward cards ---------- */
  panel.querySelectorAll('[data-reward-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.dataset.rewardCode;
      const label = btn.querySelector('[data-reward-code-label]');
      if (!code || !label) return;

      try {
        await navigator.clipboard.writeText(code);
        const original = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(() => {
          label.textContent = original;
        }, 2000);
      } catch (err) {
        console.error('[rewards] clipboard write failed', err);
      }
    });
  });

  /* ---------- Activity feed fetch + pagination ---------- */
  const historyEl = panel.querySelector('[data-rewards-history]');
  const rowsEl = panel.querySelector('[data-rewards-history-rows]');
  const paginationEl = panel.querySelector('[data-rewards-history-pagination]');
  const prevBtn = panel.querySelector('[data-rewards-prev]');
  const prevSpacer = panel.querySelector('[data-rewards-prev-spacer]');
  const nextBtn = panel.querySelector('[data-rewards-next]');
  const loadingEl = panel.querySelector('[data-rewards-loading]');

  let currentPage = 1;
  let nextCursor = null;
  let prevCursor = null;
  let hasLoaded = false;
  let loading = false;

  const escapeHtml = (value) => {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const renderRows = (activities) => {
    const rows = [];
    activities.forEach((activity) => {
      (activity.activityItems || []).forEach((a) => {
        rows.push(
          `<div class="grid grid-cols-4 border-t border-taupe-400 text-xs *:py-4 *:pr-4 md:text-sm">
            <span>${escapeHtml(a.date)}</span>
            <span>${escapeHtml(a.reward_name || a.title || '')}</span>
            <span>${escapeHtml(a.points)}</span>
            <span>${escapeHtml(a.balance_after)}</span>
          </div>`
        );
      });
    });
    rowsEl.innerHTML = rows.join('');
  };

  const updatePagination = () => {
    const showPrev = currentPage > 1 || !!prevCursor;
    const showNext = !!nextCursor;

    prevBtn.hidden = !showPrev;
    nextBtn.hidden = !showNext;
    prevSpacer.hidden = showPrev;
    paginationEl.hidden = !(showPrev || showNext);
  };

  const setLoading = (state) => {
    loading = state;
    loadingEl.hidden = !state;
  };

  const loadPage = async (cursor, pageNumber) => {
    if (!customerId || !appId) return;
    setLoading(true);

    const actualCursor = pageNumber === 1 ? null : cursor;
    const url = actualCursor
      ? `${appUrl}/loyalty/activity-feed?limit=10&cursor=${encodeURIComponent(actualCursor)}`
      : `${appUrl}/loyalty/activity-feed?limit=10`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-App-Id': appId,
          'x-Upz-Customer-Id': customerId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Upzelo ${response.status}: ${response.statusText}`);
      }

      const body = await response.json();
      const data = body && body.data ? body.data : body;

      const activities = Array.isArray(data.activities) ? data.activities : [];
      nextCursor = data.next_cursor || null;
      prevCursor = data.prev_cursor || null;
      currentPage = pageNumber || 1;

      if (activities.length > 0) {
        renderRows(activities);
        historyEl.hidden = false;
      } else if (!hasLoaded) {
        historyEl.hidden = true;
      }
      updatePagination();
    } catch (err) {
      console.error('[rewards] activity feed fetch failed', err);
    } finally {
      hasLoaded = true;
      setLoading(false);
    }
  };

  prevBtn.addEventListener('click', () => {
    if (loading) return;
    loadPage(prevCursor, currentPage - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (loading) return;
    loadPage(nextCursor, currentPage + 1);
  });

  /* ---------- Lazy load: fetch when panel becomes visible ---------- */
  const tryLoad = () => {
    if (hasLoaded || panel.hidden) return;
    loadPage(null, 1);
  };

  if (!panel.hidden) {
    tryLoad();
  } else {
    const observer = new MutationObserver(() => {
      if (!panel.hidden && !hasLoaded) {
        tryLoad();
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }
})();
