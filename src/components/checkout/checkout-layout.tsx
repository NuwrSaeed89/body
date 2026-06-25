import type { ReactNode } from "react";
import { PageContainer } from "@/components/ui/page-container";

type CheckoutLayoutProps = {
  children: ReactNode;
  summary: ReactNode;
  step: number;
  title: string;
};

export function CheckoutLayout({
  children,
  summary,
  step,
  title,
}: CheckoutLayoutProps) {
  return (
    <PageContainer as="main" className="pb-24 pt-28 md:pt-32">
      <div className="mb-8 md:mb-12">
        <CheckoutSteps current={step} />
        <h1 className="mt-6 text-2xl font-medium tracking-tight text-primary md:text-4xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div className="order-2 min-w-0 flex-1 lg:order-1">{children}</div>
        <div className="order-1 lg:order-2 lg:w-[380px] lg:shrink-0">
          <div className="lg:sticky lg:top-28">{summary}</div>
        </div>
      </div>
    </PageContainer>
  );
}

function CheckoutSteps({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Shipping" },
    { num: 2, label: "Payment" },
  ];

  return (
    <ol className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em]">
      {steps.map((step, index) => (
        <li key={step.num} className="flex items-center gap-3">
          {index > 0 && (
            <span className="material-symbols-outlined text-[14px] text-outline-variant">
              chevron_right
            </span>
          )}
          <span
            className={
              current >= step.num ? "text-primary" : "text-on-surface-variant"
            }
          >
            {step.num}. {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
