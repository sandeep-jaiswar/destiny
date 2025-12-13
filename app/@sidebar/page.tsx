import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

interface SidebarChild {
  label: string;
  href: string;
}

interface SidebarItem {
  label: string;
  children: SidebarChild[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Company Overview",
    children: [
      { label: "Security Description", href: "/des" },
      { label: "MIFID Descriptive Data", href: "/mifid" },
      { label: "Company Filings", href: "/cf" },
      { label: "Individual Company News", href: "/gn" },
    ],
  },
  {
    label: "Company Analysis",
    children: [
      { label: "Financial Analysis", href: "/fa" },
      { label: "Ownership Summary", href: "/own" },
      { label: "Drivers", href: "/driv" },
    ],
  },
  {
    label: "Research & Estimates",
    children: [
      { label: "Earnings & Estimates", href: "/ee" },
      { label: "Research Portal: Single Sec", href: "/brcc" },
      { label: "B1 Company Primer", href: "/b1co" },
    ],
  },
  {
    label: "Comparative Analytics",
    children: [
      { label: "Equity Relative Valuation", href: "/eqrv" },
      { label: "Relative Valuation", href: "/rv" },
    ],
  },
  {
    label: "Charting & Reporting",
    children: [
      { label: "Line Chart", href: "/gp" },
      { label: "Graph Fundamentals", href: "/gfp" },
      { label: "Company Map", href: "/cmap" },
    ],
  },
  {
    label: "Security Surveillance",
    children: [
      { label: "Company Events", href: "/evt" },
      { label: "Bloomberg Quote", href: "/bq" },
    ],
  },
  {
    label: "Trade Analytics",
    children: [
      { label: "IOI & Advert Overview", href: "/ioia" },
      { label: "Market Depth Monitor", href: "/mdw" },
      { label: "Price and Vol Dashboard", href: "/wvap" },
      { label: "Broker Rankings", href: "/rank" },
      { label: "Trading Performance", href: "/tp" },
      { label: "Venue Analytics", href: "/venu" },
    ],
  },
  {
    label: "Derivatives",
    children: [
      { label: "Option Monitor", href: "/omon" },
    ],
  },
];


export default function SidebarPage() {
  return (
    <aside className="w-full h-[calc(100vh-48px)] bg-[var(--sidebar-bg)] border-r-2 border-[var(--sidebar-border)] flex flex-col font-mono text-[14px] select-none shadow-2xl" role="complementary" aria-label="Sidebar">
      <nav className="flex-1 overflow-y-auto pt-2" role="navigation" aria-label="Main sections">
        <Accordion type="single" collapsible className="w-full" defaultValue={SIDEBAR_ITEMS[0]?.label}>
          {SIDEBAR_ITEMS.map((item) => (
            <AccordionItem key={item.label} value={item.label} className="border-none">
              <AccordionTrigger
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-none border-l-4 transition-colors duration-100
                  data-[state=open]:bg-[var(--sidebar-active-bg)] data-[state=open]:border-[var(--sidebar-accent)] data-[state=open]:text-[var(--sidebar-accent)] data-[state=open]:font-bold
                  data-[state=closed]:border-transparent data-[state=closed]:text-[var(--sidebar-fg)] data-[state=closed]:hover:bg-[var(--sidebar-active-bg)] data-[state=closed]:hover:text-[var(--sidebar-accent)] data-[state=closed]:hover:border-[var(--sidebar-accent)]"
              >
                <span>{item.label}</span>
              </AccordionTrigger>
              <AccordionContent className="pl-7 py-1 border-l-2 border-[var(--sidebar-accent)] bg-[var(--sidebar-bg)]">
                <div className="px-2 py-1.5 text-[var(--sidebar-accent)] font-semibold text-[13px] mb-1">{item.label}</div>
                <ul className="space-y-0.5">
                  {item.children.map((child) => (
                    <li key={child.label + child.href}>
                      <Link
                        href={child.href}
                        className="block px-2 py-1.5 rounded text-[var(--sidebar-fg)] hover:text-[var(--sidebar-accent)] hover:bg-[var(--sidebar-active-bg)] transition-colors duration-75 text-[13px]"
                        prefetch={false}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </aside>
  );
}
