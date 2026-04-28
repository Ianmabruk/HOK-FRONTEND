export const roomTypeOptions = [
  'living-room',
  'bedroom',
  'kitchen',
  'office',
  'dining',
  'outdoor',
  'bathroom',
  'entryway',
]

export const shopTaxonomy = {
  mainCategories: [
    { slug: 'furniture', label: 'Furniture' },
    { slug: 'decor', label: 'Decor' },
    { slug: 'soft-furnishings', label: 'Soft Furnishings' },
  ],
  subcategories: {
    decor: [
      { slug: 'mirrors', label: 'Mirrors' },
      { slug: 'decorative-items', label: 'Decorative Items' },
    ],
    'soft-furnishings': [
      { slug: 'curtains', label: 'Curtains' },
      { slug: 'pillow-cases', label: 'Pillow Cases' },
      { slug: 'carpets', label: 'Carpets' },
    ],
  },
}

const subcategoryKeywords = {
  mirrors: ['mirror', 'mirrors'],
  'decorative-items': ['decor', 'decorative', 'vase', 'art', 'sculpture', 'candle', 'tray', 'ornament', 'wall piece'],
  curtains: ['curtain', 'drape', 'drapery', 'sheer', 'blackout'],
  'pillow-cases': ['pillow', 'cushion', 'pillow case', 'throw pillow'],
  carpets: ['carpet', 'rug', 'runner'],
}

const decorKeywords = new Set(['mirror', 'decor', 'decorative', 'vase', 'art', 'sculpture', 'ornament', 'candle', 'tray', 'wall'])
const softKeywords = new Set(['curtain', 'drape', 'drapery', 'sheer', 'pillow', 'cushion', 'rug', 'carpet', 'textile'])

export function formatCategoryLabel(slug = '') {
  if (!slug) return 'All'
  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function keywordText(product = {}) {
  return [product.title, product.description, product.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function getProductTaxonomy(product = {}) {
  const text = keywordText(product)
  let mainCategory = 'furniture'
  let subcategory = ''

  Object.entries(subcategoryKeywords).some(([slug, keywords]) => {
    const matched = keywords.some((keyword) => text.includes(keyword))
    if (!matched) return false
    subcategory = slug
    mainCategory = slug === 'mirrors' || slug === 'decorative-items' ? 'decor' : 'soft-furnishings'
    return true
  })

  if (!subcategory) {
    if ([...softKeywords].some((keyword) => text.includes(keyword))) {
      mainCategory = 'soft-furnishings'
    } else if ([...decorKeywords].some((keyword) => text.includes(keyword))) {
      mainCategory = 'decor'
    }
  }

  return {
    mainCategory,
    mainCategoryLabel: formatCategoryLabel(mainCategory),
    subcategory,
    subcategoryLabel: subcategory ? formatCategoryLabel(subcategory) : '',
    roomType: product.category || '',
    roomTypeLabel: product.category ? formatCategoryLabel(product.category) : 'General',
  }
}

export function productMatchesTaxonomy(product, filters) {
  const taxonomy = getProductTaxonomy(product)
  if (filters.mainCategory && taxonomy.mainCategory !== filters.mainCategory) return false
  if (filters.subcategory && taxonomy.subcategory !== filters.subcategory) return false
  return true
}

export function sortProducts(products, sort) {
  const next = [...products]
  switch (sort) {
    case 'price_asc':
      return next.sort((left, right) => Number(left.price) - Number(right.price))
    case 'price_desc':
      return next.sort((left, right) => Number(right.price) - Number(left.price))
    case 'name_asc':
      return next.sort((left, right) => left.title.localeCompare(right.title))
    case 'newest':
    default:
      return next.sort((left, right) => {
        const leftValue = left.created_at ? new Date(left.created_at).getTime() : Number(left.id) || 0
        const rightValue = right.created_at ? new Date(right.created_at).getTime() : Number(right.id) || 0
        return rightValue - leftValue
      })
  }
}