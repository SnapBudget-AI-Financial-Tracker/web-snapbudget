import { Link } from "react-router-dom";
import { MailIcon, CodeIcon, UsersIcon, Share2Icon } from "lucide-react";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produk: [
      { label: "Fitur", href: "/landing#features" },
      { label: "Harga", href: "/landing" },
      { label: "FAQ", href: "/landing" },
    ],
    perusahaan: [
      { label: "Tentang Kami", href: "/landing" },
      { label: "Karir", href: "/landing" },
      { label: "Kontak", href: "/landing" },
    ],
    legal: [
      { label: "Kebijakan Privasi", href: "/landing" },
      { label: "Syarat & Ketentuan", href: "/landing" },
      { label: "Keamanan Data", href: "/landing" },
    ],
  };

  const socialLinks = [
    { icon: Share2Icon, href: "#", label: "Twitter" },
    { icon: CodeIcon, href: "#", label: "GitHub" },
    { icon: UsersIcon, href: "#", label: "LinkedIn" },
    { icon: MailIcon, href: "mailto:hello@snapbudget.id", label: "Email" },
  ];

  return (
    <footer className="bg-bg-base pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/landing" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-success-400 to-success-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg text-success-900">S</span>
              </div>
              <span className="font-heading font-bold text-xl text-text-primary">
                SnapBudget
              </span>
            </Link>
            <p className="text-success-600 text-sm leading-relaxed mb-4">
              Aplikasi keuangan personal berbasis AI untuk membantu Anda
              mencapai tujuan finansial.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="p-2 bg-success-100 rounded-full hover:bg-success-200 transition-colors text-success-600"
                  aria-label={link.label}
                >
                  <link.icon size={18} className="text-success-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-heading font-semibold text-base mb-4 capitalize text-text-primary">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-success-600 hover:text-success-700 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-success-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-success-600">
              © {currentYear} SnapBudget. Hak cipta dilindungi.
            </p>
            <p className="text-sm text-success-600">
              Dibuat dengan <span className="text-accent-400">❤</span> di
              Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
