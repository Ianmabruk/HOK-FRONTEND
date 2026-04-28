import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi'
import { FaTiktok } from 'react-icons/fa6'
import { socialLinks } from '../../data/showcaseContent'

const socialIcons = {
  Instagram: FiInstagram,
  LinkedIn: FiLinkedin,
  TikTok: FaTiktok,
  Facebook: FiFacebook,
}

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <h2 className="font-serif text-2xl mb-3">HOK Interior Designs</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Timeless interior design pieces curated for the modern home.
          </p>
          <div className="flex gap-3 mt-5">
            {socialLinks.map(({ label, href }) => {
              const Icon = socialIcons[label]
              return (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="social-icon-link">
                <Icon size={15} />
                </a>
              )
            })}
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Shop</h4>
          {[
            { label: 'Furniture', to: '/products?mainCategory=furniture' },
            { label: 'Decor', to: '/products?mainCategory=decor' },
            { label: 'Soft Furnishings', to: '/products?mainCategory=soft-furnishings' },
            { label: 'Mirrors', to: '/products?mainCategory=decor&subcategory=mirrors' },
            { label: 'Carpets', to: '/products?mainCategory=soft-furnishings&subcategory=carpets' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block text-sm text-gray-300 hover:text-cream mb-2"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Company</h4>
          <Link to="/portfolio" className="block text-sm text-gray-300 hover:text-cream mb-2">Portfolio</Link>
          <Link to="/before-after" className="block text-sm text-gray-300 hover:text-cream mb-2">Before &amp; After</Link>
          {['Press', 'Careers', 'Sustainability'].map((l) => (
            <a key={l} href="#" className="block text-sm text-gray-300 hover:text-cream mb-2">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Help</h4>
          {['Shipping & Returns', 'FAQ', 'Contact Us', 'Trade Program'].map((l) => (
            <a key={l} href="#" className="block text-sm text-gray-300 hover:text-cream mb-2">{l}</a>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} HOK Interior Designs. All rights reserved.
      </div>
    </footer>
  )
}
