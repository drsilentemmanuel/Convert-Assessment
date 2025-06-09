# Convert-Assessment
A/B Testing Assessment

# Shop Page Filtering and Styling Enhancements
This document explains the client-side code I've put in place to make my WooCommerce shop page much better. This includes cool features like dynamic product filtering, accurate product counts, and custom styling. I'll also walk you through the local setup I used for testing during development.

# 1. Overview
This project aims to improve my WooCommerce shop page experience directly in the user's browser. Here's a quick look at what it does:

Dynamic Product Filtering: Now, when users pick filters like price, category, or availability, the product list updates instantly.

Accurate Product Count: The product count at the top of the page (like "Showing 12 results") now correctly reflects the number of items after filters are applied.

Clean URLs: I've added a clever fix that automatically cleans up confusing or conflicting bits from the URL, ensuring everything runs smoothly.

Smart Page Styling: Depending on which pagination page the user is on (like page 2 or 3), the system adds a special class to the page's main <body> tag. This lets me apply specific styles to elements on those pages.

Consistent Button Look: I've applied a fresh, consistent green style to various interactive buttons across the site.

# 2. Core Components (What Goes on the Live Site)
Here are the main files that power these improvements on the live WordPress/WooCommerce site:

## 2.1. filter.html (The HTML Structure)
This file sets up the basic layout for the shop page. It includes the filter sidebar and the main area where products are shown. It's designed to work hand-in-hand with WooCommerce's standard elements and my JavaScript.

Key Parts:

#crp-filter-container: This is the main box that holds all the filter options.

#crp-selected-filters: This section displays the filters the user has already picked.

.crp-filter-section: These are individual boxes for each type of filter, like price ranges or categories.

## 2.2. convert.css (The Styling)
This stylesheet brings the visual improvements to life. It handles how the filter sidebar looks and applies my custom green style to buttons.

Key Styling Notes:

I'm using !important a bit to make sure my styles always win over any default theme or plugin designs.

The styles are built to look good on all screen sizes, from phones to desktops.

I've made sure various buttons and pagination elements have a consistent, branded look.

## 2.3. convert code.js (The Brains - JavaScript)
This is the main client-side script that makes everything dynamic. It manages the filtering, keeps the URL tidy, and dynamically applies styles.

How it Works:

Instant URL Cleanup: Right when the page loads, this script checks for and removes any problematic URL parameters (like visualEditor or _conv_eignore). This quick redirect ensures the page loads correctly without conflicts.

Product Data Source (window.wooProducts): The script expects window.wooProducts to be available. This global variable should already hold the filtered product data that the server provides for the current page.

Keeping Track of Filters (URL Parameters): It uses URL parameters (product_cat, min_price, max_price, filter_stock_status) to remember which filters are active even if the user reloads the page.

Event Listeners: The script listens for users clicking on filter checkboxes or "remove filter" buttons, then triggers a page update to show the new results.

Dynamic Page Classes: The applyClientSidePageClass() function looks at the current shop page number in the URL (e.g., /shop/page/2/) and adds a special class like client-paged-2 to the main <body> tag. This allows my CSS to apply unique styles to elements only on that specific page.

# 3. Local Testing Environment Setup
To make testing super efficient and avoid messing with the live WordPress site, I set up a simple folder on my local computer. This let me quickly test changes to the HTML, CSS, and JavaScript. It was particularly helpful when figuring out how those external tools were adding parameters to the URL.

## 3.1. Folder Structure
Here's how I organized my testing folder:

/local-test-shop/
├── index.html            // My mock shop page HTML
├── styles.css            // All my custom CSS for local testing
├── main.js               // All my custom JavaScript logic for local testing
├── assets/               // Optional: Where I kept any images (e.g., 'hoddie.webp')
│   └── hoddie.webp
└── (other assets/folders)


## 3.2. index.html (My Local Test Shop Page)
This HTML file acts as a pretend shop page for my local tests. It includes the necessary HTML for the filter section and a product list. I also added some made-up product data right in the script to mimic what my live WooCommerce site provides.

Key Parts:

id="filter": The main container for all the filter elements on this test page.

id="product-list": This is where main.js dynamically displays the products.

It links directly to styles.css and main.js.

## 3.3. styles.css (My Local Test Styling)
This CSS file provides basic styling for the local test page. It handles how the filter sidebar looks and how products are displayed.

Key Styling Notes:

It sets up a flexible layout for the main content area.

It adds simple box-shadows and padding to the filter elements.

## 3.4. main.js (My Local Test JavaScript Logic)
This JavaScript file holds a made-up products array and the core filtering logic I used for testing. It directly renders products into the product-list element.

How it Works:

products array: This is a list of dummy product objects that served as the data source for local filtering, standing in for window.wooProducts.

filterProducts(): This is the main function that filters the products array based on different criteria.

renderProducts(): This function updates the product-list HTML element to show only the filtered products.

getSelectedFilters() & handleFilterChange(): These functions read what filters the user has selected in the test environment and then trigger the product display to update.

It listens for user interactions (like checkbox clicks) after the page has fully loaded.

## 3.5. Running the Local Test
Save the files: Just put index.html, styles.css (inside a css/ folder), and main.js (inside a js/ folder) into the /local-test-shop/ directory as I described above. If you have any images, make sure they are in an assets/ folder relative to index.html.

Open index.html: Simply open the index.html file in your web browser.

Play with the filters: Try clicking on the filter checkboxes. You'll see the product list update instantly without the page reloading. This setup is great for testing the filtering and styling by themselves.

# 4. Deployment Notes for WordPress/WooCommerce
When it's time to put this code on the live WordPress site, here's how to do it:

JavaScript:

Recommended (Easiest): Use a plugin like "Insert Headers and Footers" or "Code Snippets." Just copy and paste the entire content of convert code.js into their "Scripts in Header" or "Scripts in Footer" section.

Alternatively (for developers using Child Themes): Create a new .js file (e.g., custom-shop.js) in your child theme's js folder. Then, enqueue it through your child theme's functions.php file using wp_enqueue_script. Make sure it's set to load specifically on shop pages and product archives.

CSS:

Recommended (Easiest): Copy all the custom CSS rules (from filter.html's style block and convert.css, including the body.client-paged-X rules) and paste them into Appearance > Customize > Additional CSS in your WordPress dashboard. This is the safest way to override any default theme styles.

Alternatively (for developers using Child Themes): Add these CSS rules directly to your child theme's style.css file.

HTML: The HTML structure for the filter sidebar (like the crp-filter-container) needs to be placed within your WooCommerce shop page template. You'd typically do this by customizing a template file or using a hook provided by your theme or WooCommerce. My JavaScript expects these HTML elements to be present.

Caching: This is super important! After deploying any changes, always clear all levels of caching. This includes WordPress plugins, server-side caches, CDN caches, and even your browser's cache. This makes sure users see the very latest version of the code.

# 5. Important Considerations
!important Usage: I've used !important flags in the CSS to make sure my styles always take priority. While effective, it's good to use them only when necessary.

URL Cleanup: The instant URL cleanup in JavaScript is a critical fix. It prevents external tools from adding URL parameters that could mess with how WordPress/WooCommerce handles pagination and other features.

window.wooProducts: My JavaScript relies on window.wooProducts being available and filled with the right product data from the server for the current page. Please ensure my server-side setup populates this global variable correctly.
