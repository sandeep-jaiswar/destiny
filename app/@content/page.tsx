"use client";

import { useAppSelector } from "@/store";
import { ContentKey } from "@/store/types/contentKey";

export default function ContentPage() {
  const contentKey = useAppSelector((state) => state.config.contentKey);

  switch (contentKey) {
    case ContentKey.SecurityDescription:
      return <div>Security Description Content</div>;
    case ContentKey.MifidDescriptiveData:
      return <div>MIFID Descriptive Data Content</div>;
    case ContentKey.CompanyFilings:
      return <div>Company Filings Content</div>;
    case ContentKey.IndividualCompanyNews:
      return <div>Individual Company News Content</div>;
    case ContentKey.FinancialAnalysis:
      return <div>Financial Analysis Content</div>;
    case ContentKey.OwnershipSummary:
      return <div>Ownership Summary Content</div>;
    case ContentKey.Drivers:
      return <div>Drivers Content</div>;
    case ContentKey.EarningsEstimates:
      return <div>Earnings & Estimates Content</div>;
    case ContentKey.ResearchPortal:
      return <div>Research Portal: Single Sec Content</div>;
    case ContentKey.B1CompanyPrimer:
      return <div>B1 Company Primer Content</div>;
    case ContentKey.EquityRelativeValuation:
      return <div>Equity Relative Valuation Content</div>;
    case ContentKey.RelativeValuation:
      return <div>Relative Valuation Content</div>;
    case ContentKey.LineChart:
      return <div>Line Chart Content</div>;
    case ContentKey.GraphFundamentals:
      return <div>Graph Fundamentals Content</div>;
    case ContentKey.CompanyMap:
      return <div>Company Map Content</div>;
    case ContentKey.CompanyEvents:
      return <div>Company Events Content</div>;
    case ContentKey.BloombergQuote:
      return <div>Bloomberg Quote Content</div>;
    case ContentKey.IOIAdvertOverview:
      return <div>IOI & Advert Overview Content</div>;
    case ContentKey.MarketDepthMonitor:
      return <div>Market Depth Monitor Content</div>;
    case ContentKey.PriceVolDashboard:
      return <div>Price and Vol Dashboard Content</div>;
    case ContentKey.BrokerRankings:
      return <div>Broker Rankings Content</div>;
    case ContentKey.TradingPerformance:
      return <div>Trading Performance Content</div>;
    case ContentKey.VenueAnalytics:
      return <div>Venue Analytics Content</div>;
    case ContentKey.OptionMonitor:
      return <div>Option Monitor Content</div>;
    default:
      return <div>Select a section from the sidebar.</div>;
  }
}