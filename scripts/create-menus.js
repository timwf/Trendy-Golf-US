/**
 * Creates TrendyGolf navigation menus in the Shopify staging store.
 * Run with: node scripts/create-menus.js
 */

const STORE = 'trendy-golf-staging.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = '2024-10';
const ENDPOINT = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

async function shopifyGraphQL(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
  }
  return json;
}

// Helper: create an HTTP menu item
function httpItem(title, url, children = []) {
  const item = { title, type: 'HTTP', url };
  if (children.length > 0) item.items = children;
  return item;
}

// ─── MAIN MENU ───────────────────────────────────────────────

const menItems = [
  httpItem('New In', '/collections/mens-new-in', [
    httpItem('Shop All New In', '/collections/mens-new-in'),
    httpItem('Polo Shirts', '/collections/mens-tops-polo-shirts'),
    httpItem('Waterproofs', '/collections/mens-jackets-waterproof-jackets'),
    httpItem('Footwear', '/collections/mens-golf-shoes'),
  ]),
  httpItem('All Clothing', '/collections/mens-golf-apparel', [
    httpItem('Shop All Clothing', '/collections/mens-golf-apparel'),
    httpItem('Jackets', '/collections/jackets'),
    httpItem('Polo Shirts', '/collections/mens-tops-polo-shirts'),
    httpItem('Trousers', '/collections/mens-trousers'),
    httpItem('Shorts', '/collections/mens-shorts'),
    httpItem('Hoodies', '/collections/mens-tops-hoodies'),
    httpItem('Knitwear', '/collections/mens-tops-knitwear'),
    httpItem('Gilets', '/collections/mens-jackets-gilets'),
    httpItem('Hybrid Jackets', '/collections/mens-jackets-hybrid-jackets'),
    httpItem('Mid Layers', '/collections/mens-tops-mid-layers'),
    httpItem('Waterproofs', '/collections/mens-jackets-waterproof-jackets'),
  ]),
  httpItem('Brands', '/pages/brands', [
    httpItem('Shop All Brands', '/pages/brands'),
    httpItem('J.LINDEBERG', '/brands/jlindeberg'),
    httpItem('G/FORE', '/brands/g-fore'),
    httpItem('Ralph Lauren', '/brands/ralph-lauren'),
    httpItem('adidas Golf Originals', '/brands/adidas-golf-originals'),
    httpItem('BOSS', '/collections/mens-boss'),
    httpItem('Malbon', '/collections/mens-malbon-golf'),
    httpItem('Nike', '/brands/nike'),
    httpItem('adidas', '/collections/mens-adidas-golf-clothing-shoes'),
    httpItem('KJUS', '/collections/mens-kjus'),
    httpItem('Peter Millar', '/collections/mens-peter-millar'),
    httpItem('Puma', '/brands/puma'),
    httpItem('Manors', '/brands/manors'),
    httpItem('Walker Golf Things', '/collections/walker-golf-things-mens-golf-apparel'),
    httpItem('Vuori', '/collections/mens-vuori-clothing'),
  ]),
  httpItem('Footwear', '/collections/mens-golf-shoes', [
    httpItem('View All', '/collections/mens-golf-shoes'),
    httpItem('adidas', '/collections/mens-adidas-golf-shoes'),
    httpItem('adidas Golf Originals', '/collections/adidas-golf-originals-golf-shoes'),
    httpItem('G/FORE', '/collections/mens-g-fore-golf-shoes'),
    httpItem('J.LINDEBERG', '/collections/mens-j-lindeberg-designer-golf-shoes-selection'),
    httpItem('Nike', '/collections/mens-nike-golf-shoes'),
    httpItem('Puma', '/collections/mens-puma-golf-shoes'),
    httpItem('GOATLANE', '/collections/goatlane-golf-sneakers-for-men'),
  ]),
  httpItem('Accessories', '/collections/mens-accessories', [
    httpItem('Shop All Accessories', '/collections/mens-accessories'),
    httpItem('Golf Gloves', '/collections/mens-accessories-golf-gloves'),
    httpItem('Belts', '/collections/mens-accessories-belts'),
    httpItem('Golf Bags', '/collections/mens-golf-bags'),
    httpItem('Socks', '/collections/mens-accessories-socks'),
    httpItem('Headcovers', '/collections/mens-headcovers'),
    httpItem('Bags', '/collections/mens-bags'),
    httpItem('Caps', '/collections/mens-accessories-caps'),
    httpItem('Bucket Hats', '/collections/bucket-hats'),
    httpItem('Visors', '/collections/mens-elite-golf-visors'),
  ]),
];

const womenItems = [
  httpItem('New In', '/collections/womens-new-in', [
    httpItem('Shop All New In', '/collections/womens-new-in'),
    httpItem('Footwear', '/collections/womens-golf-shoes'),
    httpItem('Polo Shirts', '/collections/womens-tops-polo-shirts'),
    httpItem('Dresses', '/collections/womens-dresses'),
  ]),
  httpItem('All Clothing', '/collections/womens-clothing-selection', [
    httpItem('Shop All', '/collections/womens-clothing-selection'),
    httpItem('Polo Shirts', '/collections/womens-tops-polo-shirts'),
    httpItem('Dresses', '/collections/womens-dresses'),
    httpItem('Skirts & Skorts', '/collections/womens-skirts-skorts'),
    httpItem('Knitwear', '/collections/womens-tops-knitwear'),
    httpItem('Jackets', '/collections/womens-golf-jackets'),
    httpItem('Trousers', '/collections/womens-trousers'),
    httpItem('Leggings', '/collections/womens-leggings'),
    httpItem('Shorts', '/collections/womens-shorts'),
    httpItem('Hoodies', '/collections/womens-tops-hoodies'),
    httpItem('Waterproofs', '/collections/waterproof-golf-attire-for-women'),
  ]),
  httpItem('Brands', '/pages/brands', [
    httpItem('Shop All Brands', '/pages/brands'),
    httpItem('adidas', '/collections/womens-adidas'),
    httpItem('Rohnisch', '/collections/womens-rohnisch'),
    httpItem('adidas Golf Originals', '/brands/adidas-golf-originals'),
    httpItem('J.LINDEBERG', '/brands/jlindeberg'),
    httpItem('Varley', '/collections/varley-women-s'),
    httpItem('Malbon', '/collections/malbon-golf-women-s-collection'),
    httpItem('G/FORE', '/collections/womens-g-fore'),
    httpItem('KJUS', '/collections/womens-kjus'),
    httpItem('Nike', '/brands/nike'),
    httpItem('Ralph Lauren', '/brands/ralph-lauren'),
    httpItem('Puma', '/brands/puma'),
    httpItem('Vuori', '/collections/womens-vuori-clothing'),
  ]),
  httpItem('Footwear', '/collections/womens-golf-shoes', [
    httpItem('View All', '/collections/womens-golf-shoes'),
    httpItem('G/FORE', '/collections/womens-g-fore-golf-shoes'),
    httpItem('Cole Haan', '/collections/womens-cole-haan'),
    httpItem('adidas', '/collections/womens-adidas-golf-shoes'),
    httpItem('New Balance', '/collections/womens-new-balance'),
    httpItem('Footjoy', '/collections/footjoy-womens-golf-shoes'),
  ]),
  httpItem('Accessories', '/collections/womens-accessories', [
    httpItem('View All', '/collections/womens-accessories'),
    httpItem('Golf Gloves', '/collections/womens-golf-gloves'),
    httpItem('Golf Bags', '/collections/womens-golf-bags'),
    httpItem('Belts', '/collections/womens-golf-belts'),
    httpItem('Socks', '/collections/womens-socks'),
    httpItem('Caps', '/collections/womens-golf-caps-collections'),
    httpItem('Beanies', '/collections/womens-golf-beanie-collection'),
    httpItem('Bucket Hats', '/collections/womens-golf-bucket-hat-selection'),
    httpItem('Visors', '/collections/womens-performance-golf-visors'),
  ]),
];

const footwearItems = [
  httpItem('Men', '/collections/mens-golf-shoes', [
    httpItem('View All', '/collections/mens-golf-shoes'),
    httpItem('adidas', '/collections/mens-adidas-golf-shoes'),
    httpItem('adidas Golf Originals', '/collections/adidas-golf-originals-golf-shoes'),
    httpItem('G/FORE', '/collections/mens-g-fore-golf-shoes'),
    httpItem('J.LINDEBERG', '/collections/mens-j-lindeberg-designer-golf-shoes-selection'),
    httpItem('Nike', '/collections/mens-nike-golf-shoes'),
    httpItem('Puma', '/collections/mens-puma-golf-shoes'),
    httpItem('GOATLANE', '/collections/goatlane-golf-sneakers-for-men'),
  ]),
  httpItem('Women', '/collections/womens-golf-shoes', [
    httpItem('View All', '/collections/womens-golf-shoes'),
    httpItem('G/FORE', '/collections/womens-g-fore-golf-shoes'),
    httpItem('adidas', '/collections/womens-adidas-golf-shoes'),
    httpItem('Footjoy', '/collections/footjoy-womens-golf-shoes'),
  ]),
  httpItem('Shoe Finder', '/pages/shoe-finder'),
];

const mainMenuItems = [
  httpItem('Men', '/collections/mens-new-in', menItems),
  httpItem('Women', '/collections/womens-clothing-selection', womenItems),
  httpItem('Footwear', '/collections/mens-golf-shoes', footwearItems),
  httpItem('Launches', '/pages/launches'),
  httpItem('Magazine', '/blogs/magazine'),
  httpItem('Shoe Finder', '/pages/shoe-finder'),
];

// ─── FOOTER MENUS ────────────────────────────────────────────

const footer1Items = [
  httpItem('Help centre', '/pages/help-centre'),
  httpItem('Contact us', '/pages/contact'),
  httpItem('Delivery', '/pages/delivery'),
  httpItem('Returns & Exchanges', '/pages/returns-and-exchanges'),
];

const footer2Items = [
  httpItem('Rewards', '/pages/rewards'),
  httpItem('eGift Cards', '/products/trendygolf-egift-card'),
  httpItem('Magazine', '/blogs/magazine'),
  httpItem('Launches', '/pages/launches'),
  httpItem('TGLAB', '/pages/tglab'),
];

const footer3Items = [
  httpItem('About us', '/pages/about-us'),
  httpItem('Brands', '/pages/brands'),
  httpItem('Flagship Stores', '/pages/flagship-stores'),
  httpItem('Careers', '/pages/careers'),
  httpItem('Custom Golf Apparel', '/pages/custom-golf-apparel'),
];

const legalItems = [
  httpItem('Privacy Policy', '/pages/privacy-policy'),
  httpItem('Terms & Conditions', '/pages/terms-and-conditions'),
];

// ─── MUTATIONS ───────────────────────────────────────────────

const MENU_UPDATE = `
  mutation MenuUpdate($id: ID!, $title: String!, $handle: String, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
      menu { id title handle }
      userErrors { field message code }
    }
  }
`;

const MENU_CREATE = `
  mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id title handle }
      userErrors { field message code }
    }
  }
`;

async function main() {
  console.log('🔄 Updating main menu...');
  const mainResult = await shopifyGraphQL(MENU_UPDATE, {
    id: 'gid://shopify/Menu/324021813582',
    title: 'Main menu',
    items: mainMenuItems,
  });
  console.log('Main menu:', mainResult.data?.menuUpdate?.menu || mainResult.data?.menuUpdate?.userErrors);

  console.log('\n🔄 Updating footer menu → Footer 1 (Customer Service)...');
  const footerResult = await shopifyGraphQL(MENU_UPDATE, {
    id: 'gid://shopify/Menu/324021846350',
    title: 'Footer 1 - Customer Service',
    handle: 'footer',
    items: footer1Items,
  });
  console.log('Footer 1:', footerResult.data?.menuUpdate?.menu || footerResult.data?.menuUpdate?.userErrors);

  console.log('\n🔄 Creating Footer 2 (Explore)...');
  const footer2Result = await shopifyGraphQL(MENU_CREATE, {
    title: 'Footer 2 - Explore',
    handle: 'footer-2',
    items: footer2Items,
  });
  console.log('Footer 2:', footer2Result.data?.menuCreate?.menu || footer2Result.data?.menuCreate?.userErrors);

  console.log('\n🔄 Creating Footer 3 (Company)...');
  const footer3Result = await shopifyGraphQL(MENU_CREATE, {
    title: 'Footer 3 - Company',
    handle: 'footer-3',
    items: footer3Items,
  });
  console.log('Footer 3:', footer3Result.data?.menuCreate?.menu || footer3Result.data?.menuCreate?.userErrors);

  console.log('\n🔄 Creating Legal menu...');
  const legalResult = await shopifyGraphQL(MENU_CREATE, {
    title: 'Legal',
    handle: 'legal',
    items: legalItems,
  });
  console.log('Legal:', legalResult.data?.menuCreate?.menu || legalResult.data?.menuCreate?.userErrors);

  console.log('\n✅ Done!');
}

main().catch(console.error);
