import Link from "next/link";

type Category = {
  id: number;
  category_name: string;
};

type Brand = {
  id: number;
  brand_name: string;
};

type Product = {
  id: number;
  product_code: string;
  product_name: string;
  slug: string;
  sell_price: string;
  starting_price: string;
  available_quantity: number;
  main_image_full_url: string;
  average_rating: string;
  review_count: number;
  category?: Category;
  brand?: Brand;
};

type ProductResponse = {
  success: boolean;
  message: string;
  products: Product[];

  // API ले pagination metadata पठाएमा
  current_page?: number;
  total_pages?: number;
  total?: number;
  per_page?: number;
};

const API_URL = "https://gargdental.com/api/v1/products/all";

async function getProducts(page: number) {
  const res = await fetch(`${API_URL}?page=${page}&per_page=30`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json() as Promise<ProductResponse>;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;

  const data = await getProducts(currentPage);

  const products = data.products || [];

  // यदि API ले total_pages पठाउँछ भने त्यसलाई use गर्ने
  const totalPages = data.total_pages || 1;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-black">Products</h1>

          <p className="text-gray-500 mt-2">
            Showing page {currentPage}
          </p>
        </div>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="h-56 bg-gray-100 flex items-center justify-center">
                  <img
                    src={product.main_image_full_url}
                    alt={product.product_name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs text-gray-400">
                    {product.product_code}
                  </p>

                  <h2 className="font-semibold text-lg mt-1 line-clamp-2">
                    {product.product_name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    {product.brand?.brand_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {product.category?.category_name}
                  </p>

                  <div className="mt-4">
                    <p className="text-xl font-bold text-blue-600">
                      Rs. {Number(product.sell_price).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="block text-center mt-4 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          {currentPage > 1 ? (
            <Link
              href={`/products?page=${currentPage - 1}`}
              className="px-5 py-2 border rounded-lg bg-white hover:bg-gray-100"
            >
              ← Previous
            </Link>
          ) : (
            <span className="px-5 py-2 border rounded-lg text-gray-400">
              ← Previous
            </span>
          )}

          <span className="px-5 py-2 font-medium">
            Page {currentPage}
            {totalPages > 1 && ` of ${totalPages}`}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/products?page=${currentPage + 1}`}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next →
            </Link>
          ) : (
            <span className="px-5 py-2 border rounded-lg text-gray-400">
              Next →
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
