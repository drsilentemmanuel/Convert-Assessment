(function() {
    // Global variable to hold currently active filters.
    // This is the single source of truth for which filters are applied.
    let activeFilters = {
        price: [],       // Stores objects like { min: 0, max: 100 }
        category: [],    // Stores category slugs like "benie"
        availability: [] // Stores 'instock' or 'outofstock'
    };

    /**
     * Core function to filter products on the client-side and update their display (show/hide).
     * This function is now ONLY used on initial page load to ensure products match
     * the URL parameters, not after user interaction.
     */
    function filterAndDisplayProducts() {
        console.log("filterAndDisplayProducts called. Current active filters:", activeFilters);

        // CRITICAL: Ensure window.wooProducts exists and is an array.
        // Based on your latest clarification, window.wooProducts already contains
        // the server-filtered product data for the current page.
        if (!Array.isArray(window.wooProducts)) {
            console.error("window.wooProducts is not an array or is not loaded. Cannot perform client-side filtering.");
            return;
        }

        const productsData = window.wooProducts;
        const productElements = document.querySelectorAll('.products li.product'); // All products initially rendered by server

        let visibleProductCount = 0; // This will count products visible AFTER client-side filter

        productElements.forEach(productElement => {
            let productId = null;
            const postIdMatch = productElement.className.match(/post-(\d+)/);
            if (postIdMatch && postIdMatch[1]) {
                productId = parseInt(postIdMatch[1]);
            } else {
                const addToCartButton = productElement.querySelector('.add_to_cart_button');
                if (addToCartButton && addToCartButton.dataset.product_id) {
                    productId = parseInt(addToCartButton.dataset.product_id);
                }
            }

            const productDataItem = productsData.find(p => p.id === productId);

            if (!productDataItem) {
                // If product data not found in window.wooProducts for this HTML element, hide it.
                // This might indicate a mismatch if the server *should* be sending only filtered products.
                productElement.style.display = 'none';
                return;
            }

            // Assume it matches all filters unless a specific client-side filter rule fails.
            // This is primarily for robustness if client-side needs to refine server-side filtering.
            let matchesAllFilters = true; 

            // --- Apply Category Filter ---
            if (activeFilters.category.length > 0) {
                const productCategorySlugs = Array.isArray(productDataItem.categories)
                                            ? productDataItem.categories.map(cat => cat.toLowerCase())
                                            : [];
                const hasMatchingCategory = activeFilters.category.some(
                    selectedCatSlug => productCategorySlugs.includes(selectedCatSlug)
                );
                if (!hasMatchingCategory) {
                    matchesAllFilters = false;
                }
            }

            // --- Apply Price Filter ---
            if (matchesAllFilters && activeFilters.price.length > 0) {
                const productPrice = parseFloat(productDataItem.price);
                const hasMatchingPrice = activeFilters.price.some(range => {
                    const min = range.min;
                    const max = range.max === Infinity ? Number.MAX_VALUE : range.max;
                    return productPrice >= min && productPrice <= max;
                });
                if (!hasMatchingPrice) {
                    matchesAllFilters = false;
                }
            }

            // --- Apply Availability Filter ---
            if (matchesAllFilters && activeFilters.availability.length > 0) {
                if (activeFilters.availability.includes('instock') && !productDataItem.in_stock) {
                    matchesAllFilters = false;
                } else if (activeFilters.availability.includes('outofstock') && productDataItem.in_stock) {
                    matchesAllFilters = false;
                }
            }

            if (matchesAllFilters) {
                productElement.style.display = '';
                visibleProductCount++;
            } else {
                productElement.style.display = 'none';
            }
        });

        // --- Update the woocommerce-result-count based on window.wooProducts.length ---
        // Since window.wooProducts is confirmed to contain the server-filtered product data,
        // its length is the accurate total count of products returned by the server.
        const resultCountElement = document.querySelector('.woocommerce-result-count');
        if (resultCountElement) {
            const currentFilteredTotal = window.wooProducts.length;

            if (currentFilteredTotal > 0) {
                // Assuming you want to display the total number of filtered results.
                resultCountElement.textContent = `Showing all ${currentFilteredTotal} results`;
            } else {
                resultCountElement.textContent = 'No products found';
            }
        }
        // --- END OF RESULT COUNT UPDATE ---

        // Handle "No products found" message display
        const productLoopContainer = document.querySelector('.products');
        const noProductsMessageId = 'crp-no-products-found-message';
        let noProductsMessage = document.getElementById(noProductsMessageId);

        if (visibleProductCount === 0) {
            if (productLoopContainer) {
                productLoopContainer.style.display = 'none';
            }
            if (!noProductsMessage) {
                noProductsMessage = document.createElement('p');
                noProductsMessage.id = noProductsMessageId;
                noProductsMessage.textContent = 'No products found matching your current filters.';
                noProductsMessage.style.textAlign = 'center';
                noProductsMessage.style.padding = '20px';
                noProductsMessage.style.fontSize = '1.2em';
                if (productLoopContainer && productLoopContainer.parentNode) {
                    productLoopContainer.parentNode.insertBefore(noProductsMessage, productLoopContainer.nextSibling);
                } else {
                    document.getElementById('primary')?.appendChild(noProductsMessage);
                }
            }
            noProductsMessage.style.display = '';
        } else {
            if (productLoopContainer) {
                productLoopContainer.style.display = '';
            }
            if (noProductsMessage) {
                noProductsMessage.style.display = 'none';
            }
        }
    }

    /**
     * Helper function to get unique categories from all products.
     * Returns categories in their original casing as strings.
     */
    function getUniqueCategories() {
        const categories = new Set();
        if (Array.isArray(window.wooProducts)) {
            window.wooProducts.forEach(product => {
                if (Array.isArray(product.categories)) {
                    product.categories.forEach(cat => categories.add(cat));
                }
            });
        }
        return Array.from(categories).sort();
    }

    /**
     * Helper function to define static price ranges.
     */
    function getPriceRanges() {
        return [
            { label: 'R0 - R100', min: 0, max: 100 },
            { label: 'R101 - R200', min: 101, max: 200 },
            { label: 'R201 - R300', min: 201, max: 300 },
            { label: 'R301 - R400', min: 301, max: 400 },
            { label: 'R401 - R500', min: 401, max: 500 },
            { label: 'R501+', min: 501, max: Infinity }
        ];
    }

    /**
     * Helper function to define availability options.
     */
    function getAvailabilityOptions() {
        return [
            { label: 'In stock', value: 'instock' },
            { label: 'Out of stock', value: 'outofstock' }
        ];
    }

    /**
     * Renders filter options (e.g., categories, prices, availability) as checkboxes
     * into the specified container. It also checks the global 'activeFilters'
     * to mark checkboxes as checked initially.
     */
    function renderFilterOptions(container, options, type) {
        if (!container) {
            console.warn(`renderFilterOptions: Target container for type "${type}-filter" not found. Cannot render options.`);
            return;
        }

        let headingText = '';
        switch (type) {
            case 'price': headingText = 'Price'; break;
            case 'category': headingText = 'Categories'; break;
            case 'availability': headingText = 'Availability'; break;
            default: headingText = 'Filter Section';
        }

        container.innerHTML = '';
        const h4 = document.createElement('h4');
        h4.textContent = headingText;
        container.appendChild(h4);

        const ul = document.createElement('ul');
        ul.classList.add('filter-options-list');

        options.forEach(option => {
            let filterValue, filterLabel;
            let isChecked = false;

            if (type === 'price') {
                filterValue = `${option.min}-${option.max}`;
                filterLabel = option.label;
                isChecked = activeFilters.price.some(r => r.min === option.min && r.max === option.max);
            } else if (type === 'availability') {
                filterValue = option.value;
                filterLabel = option.label;
                isChecked = activeFilters.availability.includes(filterValue);
            } else { // Category
                filterValue = option.toLowerCase();
                filterLabel = option;
                isChecked = activeFilters.category.includes(filterValue);
            }

            const li = document.createElement('li');
            const checkboxId = `filter-${type}-${filterValue.replace(/[^a-zA-Z0-9-]/g, '_')}`;

            li.innerHTML = `
                <input type="checkbox" id="${checkboxId}" data-filter-type="${type}" value="${filterValue}" ${isChecked ? 'checked' : ''}>
                <label for="${checkboxId}">${filterLabel}</label>
            `;

            if (type === 'price') {
                li.querySelector('input').dataset.min = option.min;
                li.querySelector('input').dataset.max = option.max === Infinity ? 'Infinity' : option.max;
            }

            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    /**
     * Updates the visual display of the active filters (the "selected tags" with 'x' to remove).
     */
    function updateSelectedFiltersDisplay() {
        console.log("updateSelectedFiltersDisplay called. Current activeFilters state:", activeFilters);

        const selectedFiltersList = document.getElementById('selected-filters-list');
        const selectedFiltersSection = document.querySelector('.selected-filters-section');

        if (!selectedFiltersList) {
            console.error("CRITICAL ERROR: #selected-filters-list element NOT FOUND.");
            return;
        }
        if (!selectedFiltersSection) {
            console.error("CRITICAL ERROR: .selected-filters-section element NOT FOUND.");
            return;
        }

        selectedFiltersList.innerHTML = '';
        let filterCount = 0;

        activeFilters.price.forEach(range => {
            filterCount++;
            const label = `R${range.min}${range.max === Infinity ? '+' : '-R' + range.max}`;
            const li = document.createElement('li');
            li.id = `selected-price-${range.min}-${range.max === Infinity ? 'Infinity' : range.max}`;
            li.innerHTML = `
                <span class="remove-filter" data-filter-type="price" data-min="${range.min}" data-max="${range.max === Infinity ? 'Infinity' : range.max}">x</span>
                <span>Price: ${label}</span>
            `;
            selectedFiltersList.appendChild(li);
        });

        activeFilters.category.forEach(catSlug => {
            filterCount++;
            const originalCategory = getUniqueCategories().find(c => c.toLowerCase() === catSlug);
            const displayLabel = originalCategory ? originalCategory : catSlug.charAt(0).toUpperCase() + catSlug.slice(1);

            const li = document.createElement('li');
            li.id = `selected-category-${catSlug}`;
            li.innerHTML = `
                <span class="remove-filter" data-filter-type="category" data-filter-value="${catSlug}">x</span>
                <span>Category: ${displayLabel}</span>
            `;
            selectedFiltersList.appendChild(li);
        });

        activeFilters.availability.forEach(availValue => {
            filterCount++;
            const displayLabel = availValue === 'instock' ? 'In stock' : (availValue === 'outofstock' ? 'Out of stock' : availValue);
            const li = document.createElement('li');
            li.id = `selected-availability-${availValue}`;
            li.innerHTML = `
                <span class="remove-filter" data-filter-type="availability" data-filter-value="${availValue}">x</span>
                <span>Availability: ${displayLabel}</span>
            `;
            selectedFiltersList.appendChild(li);
        });

        if (filterCount > 0) {
            selectedFiltersSection.style.display = 'block';
        } else {
            selectedFiltersSection.style.display = 'none';
        }
    }

    /**
     * Function to detect the current pagination page from the URL and apply a client-side class to the body.
     */
    function applyClientSidePageClass() {
        const urlPath = window.location.pathname;
        // This regex looks for /shop/page/NUMBER/
        const pageMatch = urlPath.match(/\/shop\/page\/(\d+)\//);

        if (pageMatch && pageMatch[1]) {
            const pageNumber = parseInt(pageMatch[1]);
            // Only add the class for page 2 onwards, as page 1 typically doesn't have /page/1/ in the URL
            if (pageNumber > 1) {
                document.body.classList.add(`client-paged-${pageNumber}`);
                console.log(`Added client-side page class: client-paged-${pageNumber}`);
            }
        }
        // Optionally, you could add a class for page 1 if needed, e.g., if (urlPath.endsWith('/shop/') || urlPath.endsWith('/shop')) { document.body.classList.add('client-paged-1'); }
    }


    /**
     * Main initialization function for the filters.
     */
    function initFilters() {
        console.log("initFilters started.");

        // Call the new function to apply the client-side page class
        applyClientSidePageClass();

        const filterContainer = document.getElementById('crp-filter-container') || document.querySelector('.crp-filter-sidebar');
        const priceFiltersContainer = document.querySelector('div[data-filter-type="price-filter"]');
        const categoryFiltersContainer = document.querySelector('div[data-filter-type="category-filter"]');
        const availabilityFiltersContainer = document.querySelector('div[data-filter-type="stock-filter"]');

        const selectedFiltersSection = document.querySelector('.selected-filters-section');
        const selectedFiltersList = document.getElementById('selected-filters-list');

        if (!filterContainer) {
            console.error("CRITICAL: Main filter container not found. Filtering features will not be initialized.");
            return;
        }
        if (!selectedFiltersSection || !selectedFiltersList) {
            console.warn("WARNING: Selected filters display elements not found. Selected filter tags will not show.");
        }

        // --- Populate activeFilters from URL parameters on initial page load ---
        const urlParams = new URLSearchParams(window.location.search);
        activeFilters.price = [];
        activeFilters.category = [];
        activeFilters.availability = [];

        if (urlParams.has('product_cat')) {
            activeFilters.category.push(urlParams.get('product_cat').toLowerCase());
            console.log("Initial URL category filter applied:", activeFilters.category);
        }
        if (urlParams.has('min_price') && urlParams.has('max_price')) {
            const min = parseFloat(urlParams.get('min_price'));
            const maxParam = urlParams.get('max_price');
            const max = (maxParam === 'Infinity' || maxParam === 'Number.MAX_VALUE') ? Infinity : parseFloat(maxParam);
            if (!isNaN(min) && !isNaN(max)) {
                activeFilters.price.push({ min, max });
                console.log("Initial URL price filter applied:", activeFilters.price);
            }
        }
        if (urlParams.has('filter_stock_status')) {
            activeFilters.availability.push(urlParams.get('filter_stock_status').toLowerCase());
            console.log("Initial URL availability filter applied:", activeFilters.availability);
        }
        // --- End URL population ---

        // --- Render filter options (as checkboxes) into their respective containers ---
        renderFilterOptions(categoryFiltersContainer, getUniqueCategories(), 'category');
        renderFilterOptions(priceFiltersContainer, getPriceRanges(), 'price');
        renderFilterOptions(availabilityFiltersContainer, getAvailabilityOptions(), 'availability');

        // --- Attach Event Listeners for user interaction ---
        filterContainer.addEventListener('change', function (event) {
            const target = event.target;
            if (target.type === 'checkbox' && target.dataset.filterType) {
                const type = target.dataset.filterType;
                const val = target.value;

                if (type === 'price') {
                    const min = parseInt(target.dataset.min);
                    const max = target.dataset.max === 'Infinity' ? Infinity : parseInt(target.dataset.max);
                    const rangeObj = { min, max };
                    if (target.checked) {
                        if (!activeFilters.price.some(r => r.min === min && r.max === max)) {
                            activeFilters.price.push(rangeObj);
                        }
                    } else {
                        activeFilters.price = activeFilters.price.filter(r => !(r.min === min && r.max === max));
                    }
                } else {
                    if (target.checked) {
                        if (!activeFilters[type].includes(val)) {
                            activeFilters[type].push(val);
                        }
                    } else {
                        activeFilters[type] = activeFilters[type].filter(v => v !== val);
                    }
                }
                console.log("Filter checkbox changed. New activeFilters for URL update:", activeFilters);
                // Trigger the URL update and page reload
                updateUrlAndReload();
            }
        });

        if (selectedFiltersList) {
            selectedFiltersList.addEventListener('click', function (event) {
                const target = event.target;
                if (target.classList.contains('remove-filter')) {
                    const type = target.dataset.filterType;
                    if (type === 'price') {
                        const min = parseInt(target.dataset.min);
                        const max = target.dataset.max === 'Infinity' ? Infinity : parseInt(target.dataset.max);
                        activeFilters.price = activeFilters.price.filter(r => !(r.min === min && r.max === max));

                        // Uncheck the corresponding checkbox
                        const checkbox = filterContainer.querySelector(`input[data-filter-type="price"][data-min="${min}"][data-max="${target.dataset.max}"]`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    } else {
                        const val = target.dataset.filterValue;
                        activeFilters[type] = activeFilters[type].filter(v => v !== val);

                        // Uncheck the corresponding checkbox
                        const checkbox = filterContainer.querySelector(`input[data-filter-type="${type}"][value="${val}"]`);
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    }
                    console.log("Filter removed from selected tags. New activeFilters for URL update:", activeFilters);
                    // Trigger the URL update and page reload
                    updateUrlAndReload();
                }
            });
        }

        // --- Final Initialization Actions (on initial load/after reload) ---
        // This is where existing URL filters are applied to the display.
        updateSelectedFiltersDisplay();
        filterAndDisplayProducts(); // Call this once on page load to sync with URL filters and update count.

        modifyAddToCartButtons();

        // Reposition filter sidebar if necessary
        const colFull = document.querySelector('.col-full');
        const primaryContentArea = document.getElementById('primary');
        const filterSidebar = document.querySelector('.crp-filter-sidebar');
        if (colFull && primaryContentArea && filterSidebar && !filterSidebar.classList.contains('crp-filter-sidebar-initialized')) {
            colFull.insertBefore(filterSidebar, primaryContentArea);
            filterSidebar.classList.add('crp-filter-sidebar-initialized');
            console.log("Filter sidebar repositioned.");
        }
        console.log("initFilters completed.");
    }

    /**
     * Constructs the URL based on activeFilters and triggers a page reload.
     * This ensures the browser's URL reflects the filter state.
     */
    function updateUrlAndReload() {
        const currentUrl = new URL(window.location.href);
        const urlParams = currentUrl.searchParams;

        // Clear existing filter-related parameters
        urlParams.delete('product_cat');
        urlParams.delete('min_price');
        urlParams.delete('max_price');
        urlParams.delete('filter_stock_status');

        // Add active category filters
        if (activeFilters.category.length > 0) {
            // Assuming your server expects a single product_cat param.
            urlParams.set('product_cat', activeFilters.category[0]);
        }

        // Add active price filters
        if (activeFilters.price.length > 0) {
            // Assuming only one price range can be active for min_price/max_price.
            const firstPriceRange = activeFilters.price[0];
            urlParams.set('min_price', firstPriceRange.min);
            urlParams.set('max_price', firstPriceRange.max === Infinity ? 'Infinity' : firstPriceRange.max);
        }

        // Add active availability filters
        if (activeFilters.availability.length > 0) {
            // Assuming only one availability status can be active.
            urlParams.set('filter_stock_status', activeFilters.availability[0]);
        }
        
        console.log("Navigating to new URL:", currentUrl.toString());
        window.location.replace(currentUrl.toString());
    }

    /**
     * --- DOM Ready and Delayed Initialization ---
     * Ensures initFilters runs after the DOM is fully loaded, with a small delay
     * to allow other scripts or elements to settle.
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOMContentLoaded fired. Delaying initFilters by 500ms.");
            setTimeout(initFilters, 500);
        });
    } else {
        console.log("DOM already loaded. Delaying initFilters by 500ms.");
        setTimeout(initFilters, 500);
    }

    /**
     * Modifies "Add to Cart" buttons to "View Product" and links them to the product page.
     */
    function modifyAddToCartButtons() {
        document.querySelectorAll('.product .button.add_to_cart_button, .product .button.product_type_simple').forEach(button => {
            const productLink = button.closest('li.product')?.querySelector('.woocommerce-LoopProduct-link');
            if (productLink?.href) {
                button.href = productLink.href;
            }
            button.textContent = 'View Product';
        });
        console.log("Add to Cart buttons modified.");
    }
})();