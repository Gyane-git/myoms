import Link from "next/link";

type ProductItem = {
  PCode?: string;
  PDesc?: string;
  Alias?: string;
  PShortName?: string;
  GroupName?: string;
  SubGroupName?: string;
  Group1?: string;
  Group2?: string;
  Unit?: string;
  AltUnit?: string | null;
  Qty?: number | string | null;
  AltQty?: number | string | null;
  HsCode?: string | null;
  BuyRate?: number | string | null;
  SalesRate?: number | string | null;
  MRP?: number | string | null;
  TradeRate?: number | string | null;
  "Discount Percentage"?: number | string | null;
  "Image Name"?: string | null;
  "Image Folder Name"?: string | null;
  "Offer Discount"?: number | string | null;
  StockStatus?: string | null;
  StockQty?: number | string | null;
  PImage?: string | null;
  ProductPoint?: number | string | null;
  [key: string]: unknown;
};

type ProductListResponse =
  | ProductItem[]
  | {
      data?: ProductItem[];
      products?: ProductItem[];
      result?: ProductItem[];
      items?: ProductItem[];
      objLedgerDetails?: ProductItem[];
      message?: string;
      success?: boolean;
    };

const API_URL =
  "http://myomsapi.globaltechsolution.com.np:802/api/MasterList/ProductListCustomer?DbName=ERPDEMO101&BrCode=";
const PAGE_SIZE = 12;

function asArray(payload: ProductListResponse | unknown): ProductItem[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const candidate = payload as Record<string, unknown>;

    for (const key of ["data", "products", "result", "items", "objLedgerDetails"]) {
      const value = candidate[key];
      if (Array.isArray(value)) return value as ProductItem[];
    }
  }

  return [];
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value);
}

function normalizeNumber(value: unknown) {
  if (value == null || value === "") return "0.00";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : String(value);
}

function matchesSearch(product: ProductItem, query: string) {
  if (!query.trim()) return true;

  const haystack = [
    product.PCode,
    product.PDesc,
    product.Alias,
    product.PShortName,
    product.GroupName,
    product.SubGroupName,
    product.Unit,
    product.StockStatus,
  ]
    .map(normalizeString)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

function clampPage(page: number, totalPages: number) {
  if (Number.isNaN(page) || page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

async function getProducts() {
  const res = await fetch(API_URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch product list");
  }

  const payload = (await res.json()) as ProductListResponse;
  return asArray(payload);
}

function StockBadge({ status, qty }: { status: string; qty: string }) {
  const isAvailable = status.toLowerCase() === "available";
  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
          isAvailable
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
            : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`}
        />
        {status || "-"}
      </span>
      <span className="text-[11px] text-slate-400">Qty: {qty}</span>
    </div>
  );
}

function PaginationLink({
  href,
  children,
  disabled,
  active,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition";

  if (disabled) {
    return (
      <span className={`${base} cursor-not-allowed text-slate-300`}>
        {children}
      </span>
    );
  }

  if (active) {
    return (
      <span className={`${base} bg-slate-900 text-white shadow-sm`}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`}
    >
      {children}
    </Link>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page) || 1;
  const query = params.q || "";

  let products: ProductItem[] = [];
  let error = "";

  try {
    products = await getProducts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch product list";
  }

  const filteredProducts = products.filter((product) => matchesSearch(product, query));
  const filteredTotalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotalItems / PAGE_SIZE));
  const currentPage = clampPage(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredProducts.slice(start, start + PAGE_SIZE);
  const showingFrom = filteredTotalItems === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, filteredTotalItems);

  const availableCount = filteredProducts.filter(
    (p) => normalizeString(p.StockStatus).toLowerCase() === "available"
  ).length;

  const buildPageHref = (page: number) =>
    `/product?page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  // Windowed pagination so we don't render 100+ page buttons
  const pageWindow = 2;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= pageWindow
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-100">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Product Master
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {filteredTotalItems} item{filteredTotalItems === 1 ? "" : "s"} ·{" "}
              {availableCount} in stock
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form action="/product" method="get" className="flex items-center gap-2">
              <input type="hidden" name="page" value="1" />
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search code, name, group..."
                  className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Search
              </button>
              {query && (
                <Link
                  href="/product"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </Link>
              )}
            </form>
            <Link
              href="/product/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-6">
        {query && !error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            Results for <span className="font-medium text-slate-800">&ldquo;{query}&rdquo;</span>
          </div>
        )}

        {error ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-14 text-center">
            <p className="text-sm text-slate-500">
              {query ? "No products matched your search." : "No products found."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-right">Sales Rate</th>
                    <th className="px-4 py-3 text-right">MRP</th>
                    <th className="px-4 py-3 text-right">Trade Rate</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageItems.map((product, index) => {
                    const discount = normalizeNumber(product["Discount Percentage"]);
                    return (
                      <tr
                        key={`${normalizeString(product.PCode)}-${start + index}`}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3.5 align-top">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                            {normalizeString(product.PCode)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="max-w-[340px] font-medium text-slate-900 line-clamp-2">
                            {normalizeString(product.PDesc)}
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-slate-400">
                            {normalizeString(product.PShortName) && (
                              <span>{normalizeString(product.PShortName)}</span>
                            )}
                            {normalizeString(product.HsCode) && (
                              <span>· HS {normalizeString(product.HsCode)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="text-slate-700">{normalizeString(product.GroupName)}</div>
                          {normalizeString(product.SubGroupName) &&
                            normalizeString(product.SubGroupName) !== normalizeString(product.GroupName) && (
                              <div className="text-xs text-slate-400">
                                {normalizeString(product.SubGroupName)}
                              </div>
                            )}
                        </td>
                        <td className="px-4 py-3.5 align-top text-slate-600">
                          {normalizeString(product.Unit)}
                        </td>
                        <td className="px-4 py-3.5 align-top text-right tabular-nums text-slate-700">
                          {normalizeNumber(product.SalesRate)}
                        </td>
                        <td className="px-4 py-3.5 align-top text-right tabular-nums text-slate-700">
                          {normalizeNumber(product.MRP)}
                        </td>
                        <td className="px-4 py-3.5 align-top text-right tabular-nums text-slate-700">
                          {normalizeNumber(product.TradeRate)}
                        </td>
                        <td className="px-4 py-3.5 align-top text-right tabular-nums">
                          {discount !== "0.00" ? (
                            <span className="font-medium text-amber-600">{discount}%</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <StockBadge
                            status={normalizeString(product.StockStatus)}
                            qty={normalizeNumber(product.StockQty)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-800">{showingFrom}</span>–
            <span className="font-medium text-slate-800">{showingTo}</span> of{" "}
            <span className="font-medium text-slate-800">{filteredTotalItems}</span>
          </div>

          <div className="flex items-center gap-1">
            <PaginationLink
              href={buildPageHref(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </PaginationLink>

            {pageNumbers.map((page, i) => {
              const prev = pageNumbers[i - 1];
              const showEllipsis = prev !== undefined && page - prev > 1;
              return (
                <span key={page} className="flex items-center gap-1">
                  {showEllipsis && <span className="px-1 text-slate-300">…</span>}
                  <PaginationLink href={buildPageHref(page)} active={page === currentPage}>
                    {page}
                  </PaginationLink>
                </span>
              );
            })}

            <PaginationLink
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </PaginationLink>
          </div>
        </div>
      </section>
    </main>
  );
}