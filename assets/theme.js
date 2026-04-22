/* TrendyGolf UK — theme.js */

(function () {
  /* ------------------------------------------------
   * Mobile nav drawer
   * State mirrors `_reference/repo/app/components/sections/offcanvas.tsx`:
   *   activeItems = { grandParent: string|null, parent: string|null }
   * Only one L2 and one L3 panel can be visible at a time. Panels match by title.
   * All handlers are delegated off `document` so section re-renders don't break them.
   * ---------------------------------------------- */
  var activeItems = { grandParent: null, parent: null };
  var closeResetTimer = null;

  function getMobileNav() { return document.querySelector('[data-mobile-nav]'); }
  function getMobileOverlay() { return document.querySelector('[data-mobile-nav-overlay]'); }

  function renderMobileNav() {
    // Panels
    document.querySelectorAll('[data-mobile-panel-grandparent]').forEach(function (panel) {
      var active = panel.getAttribute('data-mobile-panel-grandparent') === activeItems.grandParent;
      panel.classList.toggle('translate-x-0', active);
      panel.classList.toggle('translate-x-full', !active);
    });
    document.querySelectorAll('[data-mobile-panel-parent]').forEach(function (panel) {
      var active = panel.getAttribute('data-mobile-panel-parent') === activeItems.parent;
      panel.classList.toggle('translate-x-0', active);
      panel.classList.toggle('translate-x-full', !active);
    });

    // Top-bar slots
    var idle = document.querySelector('[data-mobile-topbar-idle]');
    var backGp = document.querySelector('[data-mobile-back-grandparent]');
    var backP = document.querySelector('[data-mobile-back-parent]');
    var showParent = !!activeItems.parent;
    var showGrandparent = !showParent && !!activeItems.grandParent;
    var showIdle = !showParent && !showGrandparent;

    if (idle) idle.classList.toggle('hidden', !showIdle);
    if (backGp) {
      backGp.classList.toggle('hidden', !showGrandparent);
      backGp.classList.toggle('flex', showGrandparent);
      var gpLabel = backGp.querySelector('[data-mobile-back-grandparent-label]');
      if (gpLabel && activeItems.grandParent) gpLabel.textContent = activeItems.grandParent;
    }
    if (backP) {
      backP.classList.toggle('hidden', !showParent);
      backP.classList.toggle('flex', showParent);
      var pLabel = backP.querySelector('[data-mobile-back-parent-label]');
      if (pLabel && activeItems.parent) pLabel.textContent = activeItems.parent;
    }
  }

  function openMobileNav() {
    var mobileNav = getMobileNav();
    var mobileOverlay = getMobileOverlay();
    if (!mobileNav) return;
    if (closeResetTimer) { clearTimeout(closeResetTimer); closeResetTimer = null; }
    mobileNav.classList.remove('-translate-x-full');
    mobileNav.classList.add('translate-x-0');
    if (mobileOverlay) {
      mobileOverlay.classList.remove('opacity-0', 'pointer-events-none');
      mobileOverlay.classList.add('opacity-100', 'pointer-events-auto');
    }
    document.body.classList.add('overflow-hidden');
    var opener = document.querySelector('[data-mobile-nav-open]');
    if (opener) opener.setAttribute('aria-expanded', 'true');
    renderMobileNav();
  }

  function closeMobileNav() {
    var mobileNav = getMobileNav();
    var mobileOverlay = getMobileOverlay();
    if (!mobileNav) return;
    mobileNav.classList.add('-translate-x-full');
    mobileNav.classList.remove('translate-x-0');
    if (mobileOverlay) {
      mobileOverlay.classList.add('opacity-0', 'pointer-events-none');
      mobileOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    }
    document.body.classList.remove('overflow-hidden');
    var opener = document.querySelector('[data-mobile-nav-open]');
    if (opener) opener.setAttribute('aria-expanded', 'false');
    // Reset active state AFTER the slide-out finishes (matches source 700ms).
    if (closeResetTimer) clearTimeout(closeResetTimer);
    closeResetTimer = setTimeout(function () {
      activeItems = { grandParent: null, parent: null };
      renderMobileNav();
      closeResetTimer = null;
    }, 700);
  }

  // Delegated click handler — survives section re-renders.
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-mobile-nav-open]')) { openMobileNav(); return; }
    if (target.closest('[data-mobile-nav-close]')) { closeMobileNav(); return; }
    if (target.closest('[data-mobile-nav-overlay]')) { closeMobileNav(); return; }

    var openGp = target.closest('[data-mobile-open-grandparent]');
    if (openGp) {
      activeItems.grandParent = openGp.getAttribute('data-mobile-open-grandparent');
      renderMobileNav();
      return;
    }

    var openP = target.closest('[data-mobile-open-parent]');
    if (openP) {
      activeItems.parent = openP.getAttribute('data-mobile-open-parent');
      renderMobileNav();
      return;
    }

    if (target.closest('[data-mobile-back-parent]')) {
      activeItems.parent = null;
      renderMobileNav();
      return;
    }

    if (target.closest('[data-mobile-back-grandparent]')) {
      activeItems = { grandParent: null, parent: null };
      renderMobileNav();
      return;
    }
  });

  // Initial render so the idle top-bar slot shows on first load.
  renderMobileNav();

  /* Escape key closes mobile nav + cart drawer */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeSearch();
      if (window.cartDrawer) window.cartDrawer.close();
    }
  });

  /* ------------------------------------------------
   * Search overlay
   * ---------------------------------------------- */
  var searchOverlay = document.querySelector('[data-search-overlay]');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('-translate-y-full');
    searchOverlay.classList.add('translate-y-0');
    var input = searchOverlay.querySelector('input[type="search"]');
    if (input) input.focus();
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('-translate-y-full');
    searchOverlay.classList.remove('translate-y-0');
  }

  document.querySelectorAll('[data-search-open]').forEach(function (btn) {
    btn.addEventListener('click', openSearch);
  });
  document.querySelectorAll('[data-search-close]').forEach(function (btn) {
    btn.addEventListener('click', closeSearch);
  });

  /* ------------------------------------------------
   * Region flag selector (popover)
   * Mirrors Headless UI Popover behaviour from
   * `_reference/repo/app/components/partials/global/flagSelector.tsx`.
   * ---------------------------------------------- */
  function closeAllFlagPanels() {
    document.querySelectorAll('[data-flag-panel]').forEach(function (p) { p.classList.add('hidden'); });
    document.querySelectorAll('[data-flag-toggle]').forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-flag-toggle]');
    if (toggle) {
      var selector = toggle.closest('[data-flag-selector]');
      if (!selector) return;
      var panel = selector.querySelector('[data-flag-panel]');
      if (!panel) return;
      var willOpen = panel.classList.contains('hidden');
      closeAllFlagPanels();
      panel.classList.toggle('hidden', !willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      return;
    }
    if (!e.target.closest('[data-flag-selector]')) closeAllFlagPanels();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllFlagPanels();
  });

  /* ------------------------------------------------
   * Header scroll — transparent → solid
   * Only runs when the first section in <main> is a hero.
   * ---------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var heroFirst = document.querySelector('#main-content > .shopify-section:first-child [data-hero]');
  if (header && heroFirst) {
    function updateHeader() {
      if (window.scrollY > 50) {
        header.classList.add('header--solid');
      } else {
        header.classList.remove('header--solid');
      }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    /* Mega menu hover — switch transparent header to solid while open */
    var megaParents = header.querySelectorAll('.group\\/grandparent');
    megaParents.forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        header.classList.add('header--mega-active');
      });
      li.addEventListener('mouseleave', function () {
        header.classList.remove('header--mega-active');
      });
    });
  }
  /* ------------------------------------------------
   * Toast notification
   * ---------------------------------------------- */
  var Toast = (function () {
    var el, iconEl, textEl, timer;
    var checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>';
    var errorSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>';

    function init() {
      el = document.getElementById('toast-notification');
      if (!el) return;
      iconEl = el.querySelector('[data-toast-icon]');
      textEl = el.querySelector('[data-toast-text]');
    }

    function show(message, type) {
      if (!el) return;
      if (timer) clearTimeout(timer);

      /* Reset classes */
      el.classList.remove('bg-clubhouse-green-600', 'bg-red-500', 'bg-taupe-400');

      if (type === 'success') {
        el.classList.add('bg-clubhouse-green-600');
        iconEl.innerHTML = checkSvg;
      } else if (type === 'error') {
        el.classList.add('bg-red-500');
        iconEl.innerHTML = errorSvg;
      } else {
        el.classList.add('bg-taupe-400');
        iconEl.innerHTML = '';
      }

      textEl.textContent = message;

      /* Slide in */
      el.classList.remove('translate-x-full');
      el.classList.add('translate-x-0');

      /* Auto-dismiss after 2.5s */
      timer = setTimeout(function () {
        el.classList.add('translate-x-full');
        el.classList.remove('translate-x-0');
      }, 2500);
    }

    return { init: init, show: show };
  })();

  Toast.init();
  window.toast = Toast;

  /* ------------------------------------------------
   * Cart drawer
   * ---------------------------------------------- */
  var CartDrawer = (function () {
    var cfg = window.cartDrawerConfig || {};
    var rootUrl = cfg.rootUrl || '/';
    var moneyFormat = cfg.moneyFormat || '${{amount}}';

    var drawer, overlay, closeBtn, itemsContainer, emptyMsg, footer, totalEl, countBadges;
    var upsellList, upsellSplide, upsellHeading;
    var isOpen = false;
    var focusTrigger = null;

    function init() {
      drawer = document.querySelector('[data-cart-drawer]');
      overlay = document.querySelector('[data-cart-overlay]');
      closeBtn = document.querySelector('[data-cart-close]');
      itemsContainer = document.querySelector('[data-cart-items]');
      emptyMsg = document.querySelector('[data-cart-empty]');
      footer = document.querySelector('[data-cart-footer]');
      totalEl = document.querySelector('[data-cart-total]');
      countBadges = document.querySelectorAll('[data-cart-count]');
      upsellList = document.querySelector('[data-cart-upsell-list]');
      upsellHeading = document.querySelector('[data-cart-upsell-heading]');

      if (!drawer) return;

      if (closeBtn) closeBtn.addEventListener('click', close);
      if (overlay) overlay.addEventListener('click', close);

      /* Delegate quantity + remove events */
      drawer.addEventListener('click', function (e) {
        var minusBtn = e.target.closest('[data-quantity-minus]');
        var plusBtn = e.target.closest('[data-quantity-plus]');
        var removeBtn = e.target.closest('[data-line-remove]');

        if (minusBtn) {
          e.preventDefault();
          var key = minusBtn.getAttribute('data-line-key');
          var input = drawer.querySelector('[data-quantity-input][data-line-key="' + key + '"]');
          var current = parseInt(input.value, 10) || 1;
          if (current > 1) updateItem(key, current - 1);
        } else if (plusBtn) {
          e.preventDefault();
          var key = plusBtn.getAttribute('data-line-key');
          var input = drawer.querySelector('[data-quantity-input][data-line-key="' + key + '"]');
          var current = parseInt(input.value, 10) || 1;
          updateItem(key, current + 1);
        } else if (removeBtn) {
          e.preventDefault();
          removeItem(removeBtn.getAttribute('data-line-remove'));
        }
      });

      /* Quantity input blur */
      drawer.addEventListener('change', function (e) {
        var input = e.target.closest('[data-quantity-input]');
        if (!input) return;
        var val = parseInt(input.value, 10);
        var key = input.getAttribute('data-line-key');
        if (isNaN(val) || val < 1) {
          /* Reset to previous — fetch from DOM */
          refreshDrawer();
          return;
        }
        updateItem(key, val);
      });

      /* Open drawer when clicking cart icon(s) */
      document.querySelectorAll('[data-cart-drawer-open]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          focusTrigger = btn;
          open();
        });
      });

      /* Listen for add-to-cart events from product pages */
      document.addEventListener('cart:add', function (e) {
        var detail = e.detail || {};
        addItem(detail.items || [{ id: detail.id, quantity: detail.quantity || 1 }]);
      });
    }

    /* ---- Open / Close ---- */
    function open() {
      if (!drawer || isOpen) return;
      isOpen = true;
      refreshDrawer();
      drawer.classList.remove('translate-x-full', 'shadow-none');
      drawer.classList.add('translate-x-0', 'shadow-xl');
      overlay.classList.remove('pointer-events-none', 'opacity-0');
      overlay.classList.add('opacity-100');
      document.body.classList.add('overflow-hidden');
      /* Focus close button */
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
    }

    function close() {
      if (!drawer || !isOpen) return;
      isOpen = false;
      drawer.classList.add('translate-x-full', 'shadow-none');
      drawer.classList.remove('translate-x-0', 'shadow-xl');
      overlay.classList.add('pointer-events-none', 'opacity-0');
      overlay.classList.remove('opacity-100');
      document.body.classList.remove('overflow-hidden');
      /* Return focus */
      if (focusTrigger) { focusTrigger.focus(); focusTrigger = null; }
    }

    /* ---- Section Rendering — fetch fresh HTML ---- */
    function refreshDrawer() {
      return fetch(rootUrl + '?sections=cart-drawer', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          swapSection(data);
          loadUpsellProducts();
        });
    }

    function swapSection(data) {
      var html = data['cart-drawer'];
      if (!html) return;
      var tmp = document.createElement('div');
      tmp.innerHTML = html;

      /* Swap line items */
      var newItems = tmp.querySelector('[data-cart-items]');
      if (newItems && itemsContainer) itemsContainer.innerHTML = newItems.innerHTML;

      /* Swap footer */
      var newFooter = tmp.querySelector('[data-cart-footer]');
      if (newFooter && footer) {
        footer.innerHTML = newFooter.innerHTML;
        footer.hidden = newFooter.hidden;
      }

      /* Empty state */
      var newEmpty = tmp.querySelector('[data-cart-empty]');
      if (newEmpty && emptyMsg) emptyMsg.hidden = newEmpty.hidden;

      /* Update total in footer */
      totalEl = footer ? footer.querySelector('[data-cart-total]') : null;

      /* Upsell heading */
      var newHeading = tmp.querySelector('[data-cart-upsell-heading]');
      if (newHeading && upsellHeading) upsellHeading.textContent = newHeading.textContent;

      /* Update count badges */
      var newCount = tmp.querySelector('[data-cart-drawer-count]');
      var count = newCount ? newCount.textContent.trim() : '0';
      updateCount(count);

      /* Dispatch changed event */
      document.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: count } }));
    }

    function updateCount(count) {
      countBadges = document.querySelectorAll('[data-cart-count]');
      countBadges.forEach(function (badge) {
        badge.textContent = count;
        badge.hidden = count === '0' || count === '';
      });
    }

    /* ---- Line item loading state ---- */
    function setLineLoading(key, loading) {
      var line = drawer.querySelector('[data-line-key="' + key + '"]');
      var spinner = drawer.querySelector('[data-line-spinner="' + key + '"]');
      if (!line) return;
      if (loading) {
        line.classList.add('pointer-events-none', 'opacity-50');
        if (spinner) spinner.classList.remove('hidden');
      } else {
        line.classList.remove('pointer-events-none', 'opacity-50');
        if (spinner) spinner.classList.add('hidden');
      }
    }

    /* ---- AJAX Cart mutations ---- */
    function addItem(items) {
      return fetch(rootUrl + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items, sections: 'cart-drawer' }),
        credentials: 'same-origin'
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status === 422) {
            Toast.show(data.description || 'Unable to add product due to limited availability', 'error');
            return;
          }
          if (data.sections) swapSection(data.sections);
          loadUpsellProducts();
          Toast.show('Product added to basket', 'success');
        })
        .catch(function (err) {
          console.error('Cart add failed:', err);
          Toast.show('Something went wrong. Please try again.', 'error');
        });
    }

    function removeItem(key) {
      setLineLoading(key, true);
      return fetch(rootUrl + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0, sections: 'cart-drawer' }),
        credentials: 'same-origin'
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status && data.status !== 200) {
            Toast.show(data.description || data.message || 'Could not remove item', 'error');
            refreshDrawer();
            return;
          }
          if (data.sections) swapSection(data.sections);
          loadUpsellProducts();
        })
        .catch(function (err) {
          console.error('Cart remove failed:', err);
          setLineLoading(key, false);
        });
    }

    function updateItem(key, quantity) {
      setLineLoading(key, true);
      return fetch(rootUrl + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity, sections: 'cart-drawer' }),
        credentials: 'same-origin'
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status && data.status !== 200) {
            /* 422 = inventory exceeded — Shopify still adjusts to max available */
            Toast.show(data.description || data.message || 'Could not update quantity', 'error');
            /* Refresh to show actual cart state */
            refreshDrawer();
            return;
          }
          if (data.sections) swapSection(data.sections);
        })
        .catch(function (err) {
          console.error('Cart update failed:', err);
          setLineLoading(key, false);
        });
    }

    /* ---- Upsell carousel — Rebuy → Shopify Recommendations → fallback collection ---- */
    var upsellLoaded = false;

    function loadUpsellProducts() {
      /* Get Rebuy API key from section config */
      var section = document.getElementById('shopify-section-cart-drawer');
      var rebuyKey = section ? section.querySelector('[data-cart-drawer]') : null;
      var apiKey = window.cartDrawerConfig ? window.cartDrawerConfig.rebuyApiKey : null;

      if (apiKey) {
        fetchRebuy(apiKey).then(function (products) {
          if (products && products.length) {
            renderUpsellProducts(products);
          } else {
            fetchShopifyRecommendations();
          }
        }).catch(function () {
          fetchShopifyRecommendations();
        });
      } else {
        fetchShopifyRecommendations();
      }
    }

    function fetchRebuy(apiKey) {
      var url = 'https://rebuyengine.com/api/v1/products/trending_products?key=' + encodeURIComponent(apiKey) + '&limit=6';
      return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) { return data.data || []; });
    }

    function fetchShopifyRecommendations() {
      /* Need a product_id — use the first cart item */
      var firstItem = drawer.querySelector('[data-line-key]');
      if (!firstItem) return; /* No items in cart, keep fallback collection */

      /* Extract product ID from the line item's product URL */
      var productLink = firstItem.querySelector('a[href*="/products/"]');
      if (!productLink) return;

      var handle = productLink.getAttribute('href').split('/products/')[1];
      if (!handle) return;
      handle = handle.split('?')[0].split('#')[0];

      /* First get the product JSON to obtain the product ID */
      fetch(rootUrl + 'products/' + handle + '.js', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (product) {
          return fetch(rootUrl + 'recommendations/products.json?product_id=' + product.id + '&limit=6&intent=related', { credentials: 'same-origin' });
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.products && data.products.length) {
            renderUpsellProducts(data.products.map(mapShopifyProduct));
          }
          /* If no recommendations, keep the fallback collection from Liquid */
        })
        .catch(function () {
          /* Keep fallback collection */
        });
    }

    function mapShopifyProduct(p) {
      return {
        title: p.title,
        handle: p.handle,
        vendor: p.vendor,
        url: rootUrl + 'products/' + p.handle,
        image: p.featured_image || (p.images && p.images[0]) || '',
        price: p.price,
        compare_at_price: p.compare_at_price,
        available: p.available
      };
    }

    function renderUpsellProducts(products) {
      if (!upsellList) return;

      /* Destroy existing Splide */
      if (upsellSplide) {
        upsellSplide.destroy();
        upsellSplide = null;
      }

      upsellList.innerHTML = products.map(function (p) {
        /* Normalize fields for both Rebuy and Shopify sources */
        var title = p.title || '';
        var handle = p.handle || '';
        var vendor = p.vendor || '';
        var url = p.url || (rootUrl + 'products/' + handle);
        var available = p.available !== false;

        /* Image — Rebuy uses .image.src, Shopify uses string */
        var imgSrc = '';
        var imgAlt = title;
        if (typeof p.image === 'string') {
          imgSrc = p.image;
        } else if (p.image && p.image.src) {
          imgSrc = p.image.src;
          imgAlt = p.image.alt || title;
        } else if (p.images && p.images.length) {
          var firstImg = p.images[0];
          imgSrc = typeof firstImg === 'string' ? firstImg : (firstImg.src || '');
          imgAlt = (firstImg.alt || title);
        }

        /* Price — Rebuy uses string cents, Shopify uses integer cents */
        var price = 0;
        var comparePrice = 0;
        if (p.variants && p.variants.length) {
          price = parseFloat(p.variants[0].price) || 0;
          comparePrice = parseFloat(p.variants[0].compare_at_price) || 0;
        } else {
          price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
          comparePrice = typeof p.compare_at_price === 'number' ? p.compare_at_price : parseFloat(p.compare_at_price) || 0;
        }

        /* Rebuy prices are in dollars, Shopify in cents */
        var isShopify = typeof p.price === 'number' && p.price > 100;
        if (isShopify) {
          price = price / 100;
          comparePrice = comparePrice / 100;
        }

        var priceHtml = '';
        if (comparePrice && comparePrice > price) {
          priceHtml = '<span class="mb-0 text-xs text-taupe-700 line-through">' + formatMoney(comparePrice) + '</span> ';
        }
        priceHtml += '<span class="mb-0 font-semibold">' + formatMoney(price) + '</span>';

        var soldOutBadge = '';
        if (!available) {
          soldOutBadge = '<div class="absolute left-0 top-0 z-[2] bg-taupe-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">Sold out</div>';
        }

        return '<li class="splide__slide">' +
          '<div class="inline-block h-full w-full">' +
            '<div class="h-full">' +
              '<div class="group relative mb-4 aspect-[9/12] overflow-hidden md:mb-5">' +
                '<a class="absolute left-0 top-0 block size-full" href="' + url + '">' +
                  (imgSrc ? '<img src="' + imgSrc + '" alt="' + escapeAttr(imgAlt) + '" class="absolute left-0 top-0 z-[1] block size-full object-cover" loading="lazy" />' : '') +
                '</a>' +
                soldOutBadge +
              '</div>' +
              '<div class="mb-2 flex flex-col gap-1 px-3 text-center">' +
                (vendor ? '<p class="mb-0 text-xs font-semibold tracking-wider text-taupe-700 md:text-sm">' + vendor + '</p>' : '') +
                '<p class="mb-0 text-base"><a href="' + url + '">' + title + '</a></p>' +
              '</div>' +
              '<div class="flex items-center justify-center gap-2 text-center">' + priceHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</li>';
      }).join('');

      initUpsellSplide();
    }

    function initUpsellSplide() {
      if (typeof Splide === 'undefined') return;
      var el = document.querySelector('[data-cart-upsell-splide]');
      if (!el) return;
      upsellSplide = new Splide(el, {
        perPage: 2,
        gap: 10,
        arrows: true,
        pagination: false,
        padding: { left: 0, right: '10%' },
        breakpoints: {
          480: {
            perPage: 1,
            padding: { left: 0, right: '40%' }
          }
        }
      }).mount();
    }

    /* ---- Money formatting ---- */
    function formatMoney(amountInUnits) {
      var amount = parseFloat(amountInUnits);
      if (isNaN(amount)) amount = 0;
      var formatted = amount.toFixed(2);
      return moneyFormat
        .replace('{{amount}}', formatted)
        .replace('{{amount_no_decimals}}', Math.round(amount).toString())
        .replace('{{amount_with_comma_separator}}', formatted.replace('.', ','))
        .replace('{{amount_no_decimals_with_comma_separator}}', Math.round(amount).toString());
    }

    function escapeAttr(str) {
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ---- Focus trap ---- */
    function trapFocus(e) {
      if (!isOpen || !drawer) return;
      if (e.key !== 'Tab') return;
      var focusable = drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', trapFocus);

    /* ---- Public API ---- */
    return {
      init: init,
      open: open,
      close: close,
      addItem: addItem,
      refreshDrawer: refreshDrawer
    };
  })();

  /* Initialise cart drawer */
  CartDrawer.init();
  window.cartDrawer = CartDrawer;

  /* ------------------------------------------------
   * Rewards (Upzelo / TGCC) — delegated triggers
   * Buttons may live inside re-rendered sections (cart drawer),
   * so use document-level delegation rather than direct binding.
   * ---------------------------------------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-rewards-modal-open]')) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('openRewardsModal'));
    } else if (e.target.closest('[data-upzelo-toggle]')) {
      e.preventDefault();
      if (window.upzelo && typeof window.upzelo.toggle === 'function') {
        window.upzelo.toggle();
      }
    }
  });

  /* ------------------------------------------------
   * Rewards modal — overlay/close/escape
   * ---------------------------------------------- */
  var RewardsModal = (function () {
    var modal, backdrop, panel, closeBtn;
    var lastTrigger = null;

    function init() {
      modal = document.querySelector('[data-rewards-modal]');
      if (!modal) return;
      backdrop = modal.querySelector('[data-rewards-modal-backdrop]');
      panel = modal.querySelector('[data-rewards-modal-panel]');
      closeBtn = modal.querySelector('[data-rewards-modal-close]');

      if (closeBtn) closeBtn.addEventListener('click', close);
      if (backdrop) backdrop.addEventListener('click', close);

      window.addEventListener('openRewardsModal', function () {
        lastTrigger = document.activeElement;
        open();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        if (e.key === 'Tab') trapFocus(e);
      });
    }

    function open() {
      if (!modal) return;
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
    }

    function close() {
      if (!modal) return;
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
        lastTrigger = null;
      }
    }

    function trapFocus(e) {
      if (!modal || modal.classList.contains('hidden')) return;
      var focusable = panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    return { init: init, open: open, close: close };
  })();

  RewardsModal.init();
  window.rewardsModal = RewardsModal;

  /* ------------------------------------------------
   * Explore More — Rebuy similar-products carousel
   * Mirrors `useSimilarProducts.ts` + `getSimilarProducts.ts` + `productCarousel.tsx`.
   * Rebuy → handles → Section Rendering API (product-card-renderer) → Splide.
   * ---------------------------------------------- */
  var ExploreMore = (function () {
    var root, skeleton, loaded, list, splideEl, inviewEl;
    var splide = null;

    function init() {
      root = document.querySelector('[data-explore-more]');
      if (!root) return;

      var cfg = window.exploreMoreConfig || {};
      if (cfg.isGiftCard) return hide();
      if (!cfg.rebuyApiKey) return hide();
      if (!cfg.productId || !/^\d+$/.test(String(cfg.productId))) return hide();

      skeleton = root.querySelector('[data-explore-skeleton]');
      loaded = root.querySelector('[data-explore-loaded]');
      list = root.querySelector('[data-explore-list]');
      splideEl = root.querySelector('[data-explore-splide]');
      inviewEl = root.querySelector('[data-inview]');
      if (!list || !splideEl || !loaded) return hide();

      fetchSimilar(cfg)
        .then(function (handles) {
          if (!handles.length) return hide();
          return renderCards(handles, cfg).then(function (cardsHtml) {
            if (!cardsHtml.length) return hide();
            mountCarousel(cardsHtml);
            observeInView();
          });
        })
        .catch(function (err) {
          console.error('[ExploreMore] fetch failed', err);
          hide();
        });
    }

    function fetchSimilar(cfg) {
      var params = new URLSearchParams({
        key: cfg.rebuyApiKey,
        shopify_product_ids: String(cfg.productId),
        limit: '8'
      });
      if (cfg.countryCode) params.set('country_code', cfg.countryCode);
      var url = 'https://rebuyengine.com/api/v1/products/similar_products?' + params.toString();

      return fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (json) {
          var data = json && Array.isArray(json.data) ? json.data : [];
          return data
            .map(function (p) { return p && p.handle; })
            .filter(Boolean);
        })
        .catch(function () { return []; });
    }

    function renderCards(handles, cfg) {
      var root = cfg.rootUrl || '/';
      return Promise.all(handles.map(function (handle) {
        var url = root + 'products/' + encodeURIComponent(handle) + '?section_id=product-card-renderer';
        return fetch(url, { credentials: 'same-origin' })
          .then(function (r) { return r.ok ? r.text() : ''; })
          .then(function (html) {
            var cardHtml = extractCardHtml(html);
            return cardHtml ? { handle: handle, html: cardHtml } : null;
          })
          .catch(function () { return null; });
      })).then(function (results) {
        return results.filter(Boolean);
      });
    }

    /* Section Rendering API returns a wrapping <div id="shopify-section-product-card-renderer">.
     * Strip the wrapper and keep the card markup only. */
    function extractCardHtml(html) {
      if (!html) return '';
      var tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      var wrapper = tmp.querySelector('#shopify-section-product-card-renderer') || tmp.firstElementChild;
      return wrapper ? wrapper.innerHTML : html;
    }

    function mountCarousel(cards) {
      list.innerHTML = cards.map(function (card, i) {
        var delay = i * 90;
        return '<li class="splide__slide">' +
          '<div data-measure class="inline-block h-full w-full">' +
            '<div style="transition-delay: calc(var(--base-delay, 0ms) + ' + delay + 'ms);" class="opacity-0 scale-75 transition-all duration-1000 group-data-[inview=true]/blocks:opacity-100 group-data-[inview=true]/blocks:scale-100">' +
              card.html +
            '</div>' +
          '</div>' +
        '</li>';
      }).join('');

      if (skeleton) skeleton.remove();
      loaded.hidden = false;

      if (typeof Splide === 'undefined') return;
      splide = new Splide(splideEl, {
        perPage: 4,
        gap: 10,
        arrows: true,
        pagination: false,
        breakpoints: {
          480: { perPage: 1, arrows: false, padding: { left: 0, right: '35%' } },
          768: { perPage: 2, arrows: false, padding: { left: 0, right: '20%' } },
          1280: { perPage: 3, padding: { left: 0, right: '10%' } }
        }
      }).mount();
    }

    function observeInView() {
      if (!inviewEl || !('IntersectionObserver' in window)) {
        if (inviewEl) inviewEl.setAttribute('data-inview', 'true');
        return;
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            inviewEl.setAttribute('data-inview', 'true');
            obs.disconnect();
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -20%' });
      obs.observe(inviewEl);
    }

    function hide() {
      if (root) root.hidden = true;
    }

    return { init: init };
  })();

  ExploreMore.init();
  window.exploreMore = ExploreMore;
})();
