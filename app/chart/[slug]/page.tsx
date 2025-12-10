import { ChartClient } from "./ChartClient";

const Chart = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return <ChartClient symbol={slug} />;
};

export default Chart;
