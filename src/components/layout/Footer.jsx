import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi'

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
            {[{ icon: FiInstagram, label: 'Instagram' }, { icon: FiTwitter, label: 'Twitter' }, { icon: FiFacebook, label: 'Facebook' }, { icon: FiMail, label: 'Email' }].map(({ icon: Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-700 text-gray-400 hover:text-cream hover:border-gray-500 transition-colors">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Shop</h4>
          {['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Outdoor'].map((c) => (
            <Link
              key={c}
              to={`/products?category=${c.toLowerCase().replace(' ', '-')}`}
              className="block text-sm text-gray-300 hover:text-cream mb-2"
            >
              {c}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Company</h4>
          {['About', 'Press', 'Careers', 'Sustainability'].map((l) => (
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
