import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white py-8 mt-12" style={{ backgroundColor: '#95818D' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Abyrgi.is</h3>
            <p className="text-gray-300 text-sm mb-4">
              Áreiðanleg og örugg ferðaþjónusta á Íslandi. 
              Við bjóðum upp á þægilegar ferðir um allt land.
            </p>
            <p className="text-gray-300 text-sm">
              📍 Reykjavík, Ísland
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Flýtileiðir</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Um okkur
                </Link>
              </li>
              <li>
                <Link href="/stadsetnig" className="text-gray-300 hover:text-white transition-colors">
                  Panta ferð
                </Link>
              </li>
              <li>
                <Link href="/minarsidur" className="text-gray-300 hover:text-white transition-colors">
                  Mínar síður
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Þjónustuvér</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+354-581-2345" className="text-gray-300 hover:text-white transition-colors">
                  📞 581-2345
                </a>
              </li>
              <li>
                <a href="mailto:support@abyrgi.afd.is" className="text-gray-300 hover:text-white transition-colors">
                  ✉️ support@abyrgi.afd.is
                </a>
              </li>
              <li>
                <span className="text-gray-300">
                  🕒 24/7 þjónusta
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Lagalegt</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://www.dominos.is/um-dominos/skilmalar" className="text-gray-300 hover:text-white transition-colors">
                  Persónuverndarstefna
                </Link>
              </li>
              <li>
                <Link href="https://www.dominos.is/um-dominos/skilmalar" className="text-gray-300 hover:text-white transition-colors">
                  Skilmálar
                </Link>
              </li>
              <li>
                <Link href="https://www.dominos.is/um-dominos/skilmalar" className="text-gray-300 hover:text-white transition-colors">
                  Öryggisreglur
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Abyrgi.is. Allur réttur áskilinn.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
