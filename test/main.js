// write functionality to filter products by category, price and availability
const products = [
  {
    "id": 79,
    "title": "Benie – Blue",
    "price": "300",
    "regular_price": "300",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Benie"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/benie-blue/"
  },
  {
    "id": 78,
    "title": "Benie – Green",
    "price": "200",
    "regular_price": "200",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Benie"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/benie-green/"
  },
  {
    "id": 80,
    "title": "Benie – Orange",
    "price": "400",
    "regular_price": "400",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Benie"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/benie-orange/"
  },
  {
    "id": 90,
    "title": "Jacket – Blue",
    "price": "20",
    "regular_price": "20",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Jacket"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/jacket-blue/"
  },
  {
    "id": 89,
    "title": "Jacket – Green",
    "price": "10",
    "regular_price": "10",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Jacket"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/jacket-green/"
  },
  {
    "id": 92,
    "title": "Jacket – Orange",
    "price": "350",
    "regular_price": "350",
    "sale_price": "",
    "in_stock": false,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Jacket"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/jacket-orange/"
  },
  {
    "id": 91,
    "title": "Jacket – Pink",
    "price": "250",
    "regular_price": "250",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Jacket"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/jacket-pink/"
  },
  {
    "id": 87,
    "title": "Pants – Blue",
    "price": "300",
    "regular_price": "300",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Pants"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/pants-blue/"
  },
  {
    "id": 88,
    "title": "Pants – Green",
    "price": "400",
    "regular_price": "400",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Pants"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/pants-green/"
  },
  {
    "id": 85,
    "title": "Pants – Orange",
    "price": "100",
    "regular_price": "100",
    "sale_price": "",
    "in_stock": false,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Pants"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/pants-orange/"
  },
  {
    "id": 86,
    "title": "Pants – Pink",
    "price": "200",
    "regular_price": "200",
    "sale_price": "",
    "in_stock": false,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Pants"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/pants-pink/"
  },
  {
    "id": 61,
    "title": "Pink Benie",
    "price": "100",
    "regular_price": "100",
    "sale_price": "",
    "in_stock": true,
    "stock_quantity": null,
    "sku": "",
    "categories": ["Benie"],
    "type": "simple",
    "permalink": "https://demo.conversionratepros.co.za/product/pink-benie/"
  }
]

// Function to filter products by category, price range, and availability
function filterProducts(products, category = null, minPrice = null, maxPrice = null, inStock = null) {
  return products.filter(product => {
    const matchesCategory = category ? product.categories.includes(category) : true;
    const matchesPrice = (minPrice !== null ? parseFloat(product.price) >= minPrice : true) &&
                         (maxPrice !== null ? parseFloat(product.price) <= maxPrice : true);
    const matchesAvailability = inStock !== null ? product.in_stock === inStock : true;
    return matchesCategory && matchesPrice && matchesAvailability;
  });
}

// Render products to the DOM
function renderProducts(productArray) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  productArray.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-details';
    div.innerHTML = `
      <img src="assets/hoddie.webp" alt="#">
      <div class="caption">${product.title}</div>
      <div class="price">R${product.price},00</div>
      <div class="button">
        <a href="${product.permalink}" target="_blank"><button>View product</button></a>
      </div>
      <div class="stock">${product.in_stock ? 'In stock' : 'Out of stock'}</div>
    `;
    productList.appendChild(div);
  });
}

// --- Filter logic for UI ---
function getSelectedFilters() {
  // Price
  let minPrice = null, maxPrice = null;
  const priceInputs = document.querySelectorAll('.filter.price input[type="checkbox"]');
  priceInputs.forEach(input => {
    if (input.checked) {
      const val = input.value.match(/R?(\d+)\s*-\s*R?(\d+)/);
      if (val) {
        const min = parseInt(val[1], 10);
        const max = parseInt(val[2], 10);
        minPrice = minPrice === null ? min : Math.min(minPrice, min);
        maxPrice = maxPrice === null ? max : Math.max(maxPrice, max);
      }
    }
  });

  // Category
  let category = null;
  const catInputs = document.querySelectorAll('.filter.categories input[type="checkbox"]');
  catInputs.forEach(input => {
    if (input.checked) {
      // Use label text as category
      const label = input.nextElementSibling?.textContent.trim();
      if (label) category = label;
    }
  });

  // Availability
  let inStock = null;
  const availInputs = document.querySelectorAll('.filter.availability input[type="checkbox"]');
  availInputs.forEach(input => {
    if (input.checked) inStock = true;
  });

  return { category, minPrice, maxPrice, inStock };
}

function handleFilterChange(e) {
  e.preventDefault && e.preventDefault();
  const { category, minPrice, maxPrice, inStock } = getSelectedFilters();
  const filtered = filterProducts(products, category, minPrice, maxPrice, inStock);
  renderProducts(filtered);
}

// Attach event listeners to all filter checkboxes and forms
window.addEventListener('DOMContentLoaded', () => {
  // All checkboxes
  document.querySelectorAll('#filter input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', handleFilterChange);
  });
  // All filter forms
  document.querySelectorAll('#filter form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFilterChange(e);
    });
  });
});

// Initial render
renderProducts(products);

// Example usage
const filteredProducts = filterProducts(products, "Jacket", 100, 300, true);
console.log('results proving to work:',filteredProducts); // This will log all Jackets priced between 100 and 300 that are in stock