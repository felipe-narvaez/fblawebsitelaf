/* ── enhancements.js ────────────────────────────────────────────────────────
   Loaded last (defer), after data-store, app, browse, report, claim, admin.
   Adds: paginated Browse (12/page), debounced search (300ms), item detail page.
   ─────────────────────────────────────────────────────────────────────────── */

var ITEMS_PER_PAGE = 12;
var _page = 1;
var _sort = 'date-desc';
var _dateFilter = '';

/* ── Paginated render ──────────────────────────────────────────────────────── */
Browse.render = function (searchQuery, category) {
    if (!Browse.itemsGrid) return;

    var q   = (searchQuery !== undefined) ? searchQuery  : (Browse.searchInput   ? Browse.searchInput.value.trim() : '');
    var cat = (category    !== undefined) ? category     : (Browse.categoryFilter ? Browse.categoryFilter.value    : '');

    var items = DataStore.searchItems(q, cat);

    if (_dateFilter) {
        var now = new Date();
        var cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (_dateFilter === '7d')  cutoff.setDate(cutoff.getDate() - 6);
        else if (_dateFilter === '30d') cutoff.setDate(cutoff.getDate() - 29);
        var cutoffStr = cutoff.toISOString().split('T')[0];
        items = items.filter(function (i) { return i.dateFound >= cutoffStr; });
    }

    if (_sort === 'date-asc') {
        items = items.slice().sort(function (a, b) { return a.dateFound < b.dateFound ? -1 : a.dateFound > b.dateFound ? 1 : 0; });
    } else if (_sort === 'alpha') {
        items = items.slice().sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else {
        items = items.slice().sort(function (a, b) { return a.dateFound < b.dateFound ? 1 : a.dateFound > b.dateFound ? -1 : 0; });
    }

    var total      = items.length;
    var totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    if (_page > totalPages) _page = 1;

    var start   = (_page - 1) * ITEMS_PER_PAGE;
    var visible = items.slice(start, start + ITEMS_PER_PAGE);

    var countEl = document.getElementById('results-count');
    if (countEl) countEl.textContent = total === 0 ? '0 items found' : total + ' item' + (total !== 1 ? 's' : '') + ' found';

    if (total === 0) {
        Browse.itemsGrid.style.display = 'none';
        if (Browse.emptyState) Browse.emptyState.style.display = 'block';
    } else {
        Browse.itemsGrid.style.display = 'grid';
        if (Browse.emptyState) Browse.emptyState.style.display = 'none';
        Browse.itemsGrid.innerHTML = '';
        visible.forEach(function (item) {
            Browse.itemsGrid.appendChild(Browse.createItemCard(item));
        });
    }

    _renderPagination(total, totalPages);
};

function _renderPagination(total, totalPages) {
    var el = document.getElementById('pagination');
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (_page - 1) * ITEMS_PER_PAGE + 1;
    var end   = Math.min(_page * ITEMS_PER_PAGE, total);
    var pages = _pageRange(_page, totalPages);

    var btns = pages.map(function (p) {
        if (p === '…') return '<span class="page-ellipsis" aria-hidden="true">…</span>';
        var cls = 'page-btn' + (p === _page ? ' active' : '');
        var cur = p === _page ? ' aria-current="page"' : '';
        return '<button class="' + cls + '" onclick="window._goPage(' + p + ')" aria-label="Page ' + p + '"' + cur + '>' + p + '</button>';
    }).join('');

    el.innerHTML =
        '<div class="pagination">' +
            '<span class="pagination-info">Showing ' + start + '–' + end + ' of ' + total + ' items</span>' +
            '<div class="pagination-controls" role="navigation" aria-label="Browse items pagination">' +
                '<button class="page-btn" onclick="window._goPage(' + (_page - 1) + ')" ' + (_page <= 1 ? 'disabled' : '') + ' aria-label="Previous page">‹</button>' +
                btns +
                '<button class="page-btn" onclick="window._goPage(' + (_page + 1) + ')" ' + (_page >= totalPages ? 'disabled' : '') + ' aria-label="Next page">›</button>' +
            '</div>' +
        '</div>';
}

function _pageRange(cur, total) {
    if (total <= 7) {
        var out = [];
        for (var i = 1; i <= total; i++) out.push(i);
        return out;
    }
    if (cur <= 4)       return [1, 2, 3, 4, 5, '…', total];
    if (cur >= total-3) return [1, '…', total-4, total-3, total-2, total-1, total];
    return [1, '…', cur-1, cur, cur+1, '…', total];
}

window._goPage = function (page) {
    _page = page;
    Browse.render();
    var anchor = document.getElementById('browse-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ── Sort select ───────────────────────────────────────────────────────────── */
(function () {
    var sortEl = document.getElementById('sort-select');
    if (sortEl) {
        sortEl.addEventListener('change', function () {
            _sort = sortEl.value;
            _page = 1;
            Browse.render();
        });
    }
    var dateEl = document.getElementById('date-filter');
    if (dateEl) {
        dateEl.addEventListener('change', function () {
            _dateFilter = dateEl.value;
            _page = 1;
            Browse.render();
        });
    }
})();

/* ── Debounced search (300 ms) ─────────────────────────────────────────────── */
var _origHandleSearch = Browse.handleSearch.bind(Browse);
var _searchTimer;
Browse.handleSearch = function () {
    clearTimeout(_searchTimer);
    _page = 1;
    _searchTimer = setTimeout(_origHandleSearch, 300);
};

/* ── Item detail page ──────────────────────────────────────────────────────── */
var ItemPage = {
    show: function (itemId) {
        sessionStorage.setItem('viewItemId', itemId);
        App.navigate('item', itemId);
    },

    render: function (itemId) {
        var item = DataStore.getItemById(itemId);
        if (!item) { App.navigate('home'); return; }

        var date  = App.formatDate ? App.formatDate(item.dateFound) : item.dateFound;
        var imgBg = item.photoUrl ? 'background-image:url(\'' + item.photoUrl + '\')' : '';

        var svgPin = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
        var svgCal = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
        var svgUser = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

        document.getElementById('item-detail-content').innerHTML =
            '<div class="item-detail-grid">' +
                '<div class="item-detail-image" style="' + imgBg + '" role="img" aria-label="' + Browse.escapeHtml(item.title) + ' photo"></div>' +
                '<div class="item-detail-info">' +
                    '<p class="item-detail-category">' + Browse.escapeHtml(item.category) + '</p>' +
                    '<h1 class="item-detail-title">' + Browse.escapeHtml(item.title) + '</h1>' +
                    '<p class="item-detail-desc">' + Browse.escapeHtml(item.description) + '</p>' +
                    '<div class="item-detail-meta">' +
                        '<div class="item-detail-meta-row"><span class="item-detail-meta-label">' + svgPin + ' Location</span><span class="item-detail-meta-value">' + Browse.escapeHtml(item.locationFound) + '</span></div>' +
                        '<div class="item-detail-meta-row"><span class="item-detail-meta-label">' + svgCal + ' Date Found</span><span class="item-detail-meta-value">' + date + '</span></div>' +
                        (item.finderName ? '<div class="item-detail-meta-row"><span class="item-detail-meta-label">' + svgUser + ' Turned in by</span><span class="item-detail-meta-value">' + Browse.escapeHtml(item.finderName) + '</span></div>' : '') +
                    '</div>' +
                    '<div class="item-detail-actions">' +
                        '<button class="btn btn-accent" onclick="ItemPage.claim(\'' + item.id + '\')">Claim This Item →</button>' +
                        '<button class="btn btn-secondary" onclick="App.navigate(\'home\')">← Back to Browse</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },

    claim: function (itemId) {
        sessionStorage.setItem('claimItemId', itemId);
        App.navigate('claim');
    }
};

window.ItemPage = ItemPage;

Browse.handleClaimClick = function (itemId) {
    ItemPage.show(itemId);
};

/* ── Page show hook ────────────────────────────────────────────────────────── */
var _origOnPageShow = App.onPageShow.bind(App);
App.onPageShow = function (pageName, extra) {
    if (pageName === 'item') {
        var id = extra || sessionStorage.getItem('viewItemId');
        if (id) {
            sessionStorage.setItem('viewItemId', id);
            ItemPage.render(id);
        } else {
            App.navigate('home');
        }
        return;
    }
    if (pageName === 'home') {
        // State preserved intentionally — page/sort persist when returning from item detail
    }
    _origOnPageShow(pageName, extra);
};

/* ── Boot ──────────────────────────────────────────────────────────────────── */
(function () {
    if (Browse.itemsGrid) Browse.render('', '');
})();
