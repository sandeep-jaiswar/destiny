
"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppDispatch } from "@/store";
import { setContentKey } from "@/store";
import { ContentKey } from "@/store/types/contentKey";

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

export default function Sidebar() {
  const dispatch = useAppDispatch();
  // Helper to get ContentKey from href
  const getContentKey = (href: string): ContentKey | undefined => {
    // Remove leading slash if present
    const key = href.replace(/^\//, "");
    // Type-safe lookup
    return Object.values(ContentKey).includes(key as ContentKey)
      ? (key as ContentKey)
      : undefined;
  };
  return (
    <aside className="w-full h-[calc(100vh-48px)] bg-[#18191A] border-r-2 border-[#232324] flex flex-col font-mono text-[14px] select-none shadow-2xl">
      <nav className="flex-1 overflow-y-auto pt-2">
        <Accordion type="single" collapsible className="w-full" defaultValue={SIDEBAR_ITEMS[0]?.label}>
          {SIDEBAR_ITEMS.map((item) => (
            <AccordionItem key={item.label} value={item.label} className="border-none">
              <AccordionTrigger
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-none border-l-4 transition-colors duration-100
                  data-[state=open]:bg-[#232324] data-[state=open]:border-[#F7C948] data-[state=open]:text-[#F7C948] data-[state=open]:font-bold
                  data-[state=closed]:border-transparent data-[state=closed]:text-[#B0B3B8] data-[state=closed]:hover:bg-[#232324] data-[state=closed]:hover:text-[#F7C948] data-[state=closed]:hover:border-[#F7C948]"
              >
                <span>{item.label}</span>
              </AccordionTrigger>
              <AccordionContent className="pl-7 py-1 border-l-2 border-[#F7C948] bg-[#18191A]">
                <div className="px-2 py-1.5 text-[#F7C948] font-semibold text-[13px] mb-1">{item.label}</div>
                <ul className="space-y-0.5">
                  {item.children.map((child) => {
                    const contentKey = getContentKey(child.href);
                    return (
                      <li key={child.label + child.href}>
                        <span
                          className="block px-2 py-1.5 rounded text-[#B0B3B8] hover:text-[#F7C948] hover:bg-[#232324] transition-colors duration-75 text-[13px] cursor-pointer"
                          onClick={() => contentKey && dispatch(setContentKey(contentKey))}
                        >
                          {child.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </aside>
  );
}
