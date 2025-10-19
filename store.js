// LGHTWVS Store - Product Display
// Fetches products from Shopify and displays them

const SHOPIFY_DOMAIN = 'david-morin-drip.myshopify.com';

// Product data (from Shopify store with actual product images)
const products = [
    {
        title: 'Vintage Sunset - T-Shirt',
        price: '$24.99',
        handle: 'vintage-sunset-t-shirt-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-t-shirt_ea52c508-4cfb-42af-bb52-a93ac14b1640.jpg?v=1760852325'
    },
    {
        title: 'Vintage Sunset - Hoodie',
        price: '$44.99',
        handle: 'vintage-sunset-hoodie-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-hoodie_6f53d90d-a779-4f81-aa6e-c13f7d197cab.jpg?v=1760852328'
    },
    {
        title: 'Vintage Sunset - Mug',
        price: '$14.99',
        handle: 'vintage-sunset-mug-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-mug_ec1ef1c4-64df-4295-a860-a4e5c2048eb5.jpg?v=1760852330'
    },
    {
        title: 'Vintage Sunset - Poster',
        price: '$19.99',
        handle: 'vintage-sunset-poster-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-poster_fdba9d80-d657-418e-b498-9675c7bf70c9.jpg?v=1760852336'
    },
    {
        title: 'Vintage Sunset - Canvas Print',
        price: '$39.99',
        handle: 'vintage-sunset-canvas-print-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-canvas-print_4e22419b-fa4a-4d89-b590-a8d35b7f1e27.jpg?v=1760852336'
    },
    {
        title: 'Vintage Sunset - Sticker',
        price: '$3.99',
        handle: 'vintage-sunset-sticker-2',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-sticker_56541017-d5c0-4e7f-893d-86158a361490.jpg?v=1760852339'
    },
    {
        title: 'Vintage Sunset - Hat',
        price: '$19.99',
        handle: 'vintage-sunset-hat-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-hat_3674e4da-e30e-47d4-95b9-2d599abc2c85.jpg?v=1760852342'
    },
    {
        title: 'Vintage Sunset - Backpack',
        price: '$34.99',
        handle: 'vintage-sunset-backpack-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-backpack.jpg?v=1760852349'
    },
    {
        title: 'Vintage Sunset - Tote Bag',
        price: '$16.99',
        handle: 'vintage-sunset-tote-bag-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-tote-bag_39da68f4-ceb0-4fe6-b420-1b15f261b051.jpg?v=1760852346'
    },
    {
        title: 'Vintage Sunset - Water Bottle',
        price: '$24.99',
        handle: 'vintage-sunset-water-bottle-1',
        image: 'https://cdn.shopify.com/s/files/1/0939/8222/8764/files/vintage-sunset-water-bottle_29c6c3e2-1d93-4910-9977-4e49c1a45491.jpg?v=1760852354'
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
