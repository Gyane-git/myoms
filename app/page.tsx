export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">MyWebsite</h1>

          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>
            <a href="/product/add" className="hover:text-blue-600">
              Product
            </a>
            <a href="#" className="hover:text-blue-600">
              Service
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <section className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome Here 👋
          </h2>

          <p className="text-gray-600">
            Welcome to our simple Next.js website.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-4">
        <p className="text-sm">
          © 2026 MyWebsite. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
