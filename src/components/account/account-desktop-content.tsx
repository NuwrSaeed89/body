"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
const SIDE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5OwvUG4Im6BXKz24rqC7eP871JEVzbseNGjvwL9-j2rIZCLQdKbuhYzjIgKql_uS0yOdUqLQuR3Rly1OxvwTvDvCJHr48ThM9Q7DOZUKyKua05P2TQHhH8d0R6fn0SupD2LABX0LJN4CGUOIoIyPr1tIz1U36xt6eL6jaetbaDqWnENj1GlHvkKPQhawu39UtpfFkWyjggz3WY1krBvHb-mxoLMCO7E3YcFbRva1Rgiptwjco5jSS";
const ACTIVE_ORDER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA233i7drfcVeHf3CRX4ErfpZsr_afKTknDfMESEJgiC4MMgvC6y-As5DSJwDFMnuynJwq4HJxGlItyn0XaJLWwxMQQK2BROcb3gsFhH5uZoA2X9Fr1b3xYTz_XTV5hUP9o83wF0umtqDdttLYmGEqXYYmhibKEhJftuISg-hAYPB3aBrdy1ZA7gyW4jtfY539LUTWksOtBZAWRER3dBSDItMY3EJtshPlERtFjU2U6fNlJ0uxgYy6Q";
const RECOMMENDED_PRODUCTS = [
  {
    badge: "NEW ARRIVAL",
    name: "Elevate Leggings",
    price: "€110.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLDASdBl_ZuGyS6yLu3LveCYbjrdWQgMUwabI8hKU5kLaXLWyMxuCzytfrHLp9HWBQuG4p1YTAS6Gr8ysHND9Z-K9N-HgMq2qDMgKK75e5zJbu7aLpDrCYOF1vfO1l1mWRlEHTTZ1V22QNqY4gT4HEngP1fyuk6cknMM-U_oe2kJ6ObHTCBrCTVGpZnrRypeRL7CW0w847eiEBrIKHDx2bwUR9LdVn8gvwXkIqQSWNNK5k-BX1n_VU",
  },
  {
    badge: "CORE COLLECTION",
    name: "Precision Bra",
    price: "€75.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2zx4TvkUVnCNnkQRsvopxw6CgH1izUsA3T46rvxXN11ROZvPacubDW0jajPmbUFS6jn3JNyasEhBgMbhlrO_aE-WB1ea-SqgbU0UIoDO-SCAW7SyW4dz6gI39E7P4EKk_NvlyWeWZ0nu1BU_mCr36tvy4g23kduOU8bnGg2iX72pD0ivR_hV9sZPzd4xEsnMmWDIIFul_Uwm4dCY3cW-FsIFUQISEJZQCNpCeA-xMp247mqcIu56p",
  },
  {
    badge: "LIMITED EDITION",
    name: "Aura Windbreaker",
    price: "€145.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZwUgQLN6xx31x3GUeXUwyPMK2WYzkuVOXrFYh_fZ_aWEtdaH1scHDzF7FFRQghtvi8vCgV8jd-ZAcgk6yAiPNwOrkWxH7FhRUolL8KEBlNimpITYYEIAdaHzu-a-rt3qyDMs0k5dhAZd7ECh_QUUy4PlNVTIuB9pD-moiOBgPS6kJ-TmVBAmjRftlAu6y7W6481Chk_-twf2KDrINOCtjFd5P_bK7VlXyZYckKy4lSOelTupdRsEf",
  },
  {
    badge: "BESTSELLER",
    name: "Apex 5\" Shorts",
    price: "€65.00",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlM7z44LT-k2sBKzTuCsy95Zg5kpmQuJtmsE4xEOEZjJq1aAZhW_AOkzH6r1oMlRxD6kNsYLJ4bv1vvkUjHC7wTNZ25wqfrSW6qV-hYHF9FN34iKBQdCyC0nfHPjKhulYeVkrX2_7HlSGEF7L2-N_eAp2lIGo6xY88KUNlv7f5ZLtLznTtPdEXAMlIOJZFfjUlS9cpuS5IrSmWsU4oGTC-yAqdXpd6GhBCL5OXIleYSUbHeJVPWWR",
  },
] as const;

export function AccountDesktopContent() {

  return (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 md:flex">
        <div className="mb-10 px-4 pt-6">
          <span className="text-2xl font-bold tracking-tighter text-primary">Mbody</span>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Management Portal
          </p>
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            className="flex w-full scale-[0.98] items-center gap-3 rounded-lg bg-secondary-container px-4 py-3 font-bold text-on-secondary-container transition-all duration-200"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Dashboard</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Orders</span>
          </button>
          <Link
            href="/account/wishlist"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">favorite</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Wishlist</span>
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Addresses</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Payment</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Settings</span>
          </button>
        </nav>
        <div className="mt-auto border-t border-outline-variant p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-surface-container-high">
              <Image src={SIDE_AVATAR} alt="Elena Rossi" fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Elena Rossi</p>
              <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">
                Elite Member
              </p>
            </div>
          </div>
        </div>
        </aside>

        <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
          <header className="mb-16 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-medium tracking-tight text-primary">Welcome, Elena.</h1>
              <p className="mt-2 text-base text-secondary">
                You&apos;re currently an Elite tier member with 4,250 points.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                type="button"
                className="h-12 rounded-lg bg-primary px-6 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
              >
                Shop New Arrivals
              </button>
            </div>
          </header>

          <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">local_shipping</span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Shipping</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Default: Milan, Italy</p>
              </div>
            </article>
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">
                account_balance_wallet
              </span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Payment</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Visa ending in ••42</p>
              </div>
            </article>
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">headset_mic</span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Support</h3>
                <p className="mt-1 text-sm text-on-surface-variant">24/7 Priority Assistance</p>
              </div>
            </article>
          </section>

          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-medium text-primary">Active Order</h2>
              <button className="border-b border-secondary text-xs font-semibold uppercase tracking-[0.1em] text-secondary transition-all hover:border-primary hover:text-primary">
                View All Orders
              </button>
            </div>
            <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-64 overflow-hidden md:h-auto md:w-1/3">
                  <Image
                    src={ACTIVE_ORDER_IMAGE}
                    alt="Performance Compression Set"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-grow flex-col justify-between p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                        Order #MB-99214
                      </span>
                      <h3 className="mt-4 text-2xl font-medium text-primary">
                        Performance Compression Set
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">Color: Onyx • Size: Small</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">€185.00</p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-on-surface-variant">
                        Delivered by June 14
                      </p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="mb-2 flex justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        Current Status: Out for Delivery
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                        85% Complete
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full w-[85%] rounded-full bg-primary" />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                          Processed
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                          Shipped
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                          Transit
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-on-tertiary-container">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                          Delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="mb-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-medium text-primary">Recommended for You</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Based on your training profile and past purchases.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {RECOMMENDED_PRODUCTS.map((product) => (
                <article key={product.name} className="group cursor-pointer">
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    {product.badge}
                  </p>
                  <h4 className="text-base font-semibold text-primary">{product.name}</h4>
                  <p className="mt-1 text-sm text-secondary">{product.price}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="w-full border-t border-outline-variant bg-surface-container-low md:block">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-5 py-12 md:grid-cols-4 md:px-16">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-semibold text-primary">Mbody</span>
            <p className="mt-4 max-w-xs text-sm text-on-surface-variant">
              Engineering technical elegance for the discerning athlete. Performance redefined
              through minimalist luxury.
            </p>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">Service</h5>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>Shipping &amp; Returns</li>
              <li>Order Tracker</li>
              <li>Size Guide</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">Company</h5>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>About Us</li>
              <li>Sustainability</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">Connect</h5>
            <div className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-sm">public</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-sm">camera</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-sm">alternate_email</span>
              </span>
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.1em] text-on-tertiary-container">
              © 2024 Mbody. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
