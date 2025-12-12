// Content components for each section
const DesPage = () => (
  <div className="p-4"><h2>Security Description</h2><p>Live data for Security Description...</p></div>
);

const MifidPage = () => (
  <div className="p-4"><h2>MIFID Descriptive Data</h2><p>Live data for MIFID Descriptive Data...</p></div>
);

const CfPage = () => (
  <div className="p-4"><h2>Company Filings</h2><p>Live data for Company Filings...</p></div>
);

const GnPage = () => (
  <div className="p-4"><h2>Individual Company News</h2><p>Live data for Individual Company News...</p></div>
);

const FaPage = () => (
  <div className="p-4"><h2>Financial Analysis</h2><p>Live data for Financial Analysis...</p></div>
);

const OwnPage = () => (
  <div className="p-4"><h2>Ownership Summary</h2><p>Live data for Ownership Summary...</p></div>
);

const DrivPage = () => (
  <div className="p-4"><h2>Drivers</h2><p>Live data for Drivers...</p></div>
);

const EePage = () => (
  <div className="p-4"><h2>Earnings & Estimates</h2><p>Live data for Earnings & Estimates...</p></div>
);

const BrccPage = () => (
  <div className="p-4"><h2>Research Portal: Single Sec</h2><p>Live data for Research Portal: Single Sec...</p></div>
);

const B1coPage = () => (
  <div className="p-4"><h2>B1 Company Primer</h2><p>Live data for B1 Company Primer...</p></div>
);

const EqrvPage = () => (
  <div className="p-4"><h2>Equity Relative Valuation</h2><p>Live data for Equity Relative Valuation...</p></div>
);

const RvPage = () => (
  <div className="p-4"><h2>Relative Valuation</h2><p>Live data for Relative Valuation...</p></div>
);

const GpPage = () => (
  <div className="p-4"><h2>Line Chart</h2><p>Live data for Line Chart...</p></div>
);

const GfpPage = () => (
  <div className="p-4"><h2>Graph Fundamentals</h2><p>Live data for Graph Fundamentals...</p></div>
);

const CmapPage = () => (
  <div className="p-4"><h2>Company Map</h2><p>Live data for Company Map...</p></div>
);

const EvtPage = () => (
  <div className="p-4"><h2>Company Events</h2><p>Live data for Company Events...</p></div>
);

const BqPage = () => (
  <div className="p-4"><h2>Bloomberg Quote</h2><p>Live data for Bloomberg Quote...</p></div>
);

const IoiaPage = () => (
  <div className="p-4"><h2>IOI & Advert Overview</h2><p>Live data for IOI & Advert Overview...</p></div>
);

const MdwPage = () => (
  <div className="p-4"><h2>Market Depth Monitor</h2><p>Live data for Market Depth Monitor...</p></div>
);

const WvapPage = () => (
  <div className="p-4"><h2>Price and Vol Dashboard</h2><p>Live data for Price and Vol Dashboard...</p></div>
);

const RankPage = () => (
  <div className="p-4"><h2>Broker Rankings</h2><p>Live data for Broker Rankings...</p></div>
);

const TpPage = () => (
  <div className="p-4"><h2>Trading Performance</h2><p>Live data for Trading Performance...</p></div>
);

const VenuPage = () => (
  <div className="p-4"><h2>Venue Analytics</h2><p>Live data for Venue Analytics...</p></div>
);

const OmonPage = () => (
  <div className="p-4"><h2>Option Monitor</h2><p>Live data for Option Monitor...</p></div>
);

// Map section keys to components
const sectionComponents: Record<string, () => JSX.Element> = {
  des: DesPage,
  mifid: MifidPage,
  cf: CfPage,
  gn: GnPage,
  fa: FaPage,
  own: OwnPage,
  driv: DrivPage,
  ee: EePage,
  brcc: BrccPage,
  b1co: B1coPage,
  eqrv: EqrvPage,
  rv: RvPage,
  gp: GpPage,
  gfp: GfpPage,
  cmap: CmapPage,
  evt: EvtPage,
  bq: BqPage,
  ioia: IoiaPage,
  mdw: MdwPage,
  wvap: WvapPage,
  rank: RankPage,
  tp: TpPage,
  venu: VenuPage,
  omon: OmonPage,
};

export default function ContentPage({ params }: { params: { section: string } }) {
  const Component = sectionComponents[params.section];
  
  if (!Component) {
    return (
      <div className="p-4">
        <h2>Section Not Found</h2>
        <p>The section &quot;{params.section}&quot; does not exist.</p>
      </div>
    );
  }
  
  return <Component />;
}