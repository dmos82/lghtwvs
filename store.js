// LGHTWVS Store - Product Display
// Fetches products from Shopify and displays them

const SHOPIFY_DOMAIN = 'david-morin-drip.myshopify.com';

// Product data (from Shopify store with actual product images)
const products = [
    {
        title: 'Vintage Sunset - T-Shirt',
        price: '$24.99',
        handle: 'vintage-sunset-t-shirt-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-t-shirt_a9bb627c-3cdc-4639-8b56-37c12e531304.jpg?v=1760860006'
    },
    {
        title: 'Vintage Sunset - Hoodie',
        price: '$44.99',
        handle: 'vintage-sunset-hoodie-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-hoodie.jpg?v=1760859445'
    },
    {
        title: 'Vintage Sunset - Mug',
        price: '$14.99',
        handle: 'vintage-sunset-mug-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-mug.jpg?v=1760859429'
    },
    {
        title: 'Vintage Sunset - Poster',
        price: '$19.99',
        handle: 'vintage-sunset-poster-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-poster.jpg?v=1760859386'
    },
    {
        title: 'Vintage Sunset - Canvas Print',
        price: '$39.99',
        handle: 'vintage-sunset-canvas-print-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-canvas-print.jpg?v=1760859345'
    },
    {
        title: 'Vintage Sunset - Sticker',
        price: '$3.99',
        handle: 'vintage-sunset-sticker-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-sticker.jpg?v=1760859320'
    },
    {
        title: 'Vintage Sunset - Hat',
        price: '$19.99',
        handle: 'vintage-sunset-hat-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-hat.jpg?v=1760859291'
    },
    {
        title: 'Vintage Sunset - Backpack',
        price: '$34.99',
        handle: 'vintage-sunset-backpack-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-backpack.jpg?v=1760859271'
    },
    {
        title: 'Vintage Sunset - Tote Bag',
        price: '$16.99',
        handle: 'vintage-sunset-tote-bag-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-tote-bag.jpg?v=1760859232'
    },
    {
        title: 'Vintage Sunset - Water Bottle',
        price: '$24.99',
        handle: 'vintage-sunset-water-bottle-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-water-bottle.jpg?v=1760859212'
    }
];

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');

    products.forEach(product => {
        const card = document.createElement('a');
        card.className = 'product-card';
        card.href = `https://${SHOPIFY_DOMAIN}/products/${product.handle}`;
        card.target = '_blank';

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23111%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%230ff%22 font-family=%22monospace%22 font-size=%2220%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22%3ELGHTWVS%3C/text%3E%3C/svg%3E'">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">${product.price}</p>
            <span class="buy-now">BUY NOW</span>
        `;

        grid.appendChild(card);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', renderProducts);
