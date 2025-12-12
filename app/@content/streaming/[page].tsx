import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import type { ComponentType } from "react";
const STREAMING_COMPONENTS: Record<string, ComponentType<object>> = {
  des: dynamic(() => import("./des")),
  mifid: dynamic(() => import("./mifid")),
  cf: dynamic(() => import("./cf")),
  gn: dynamic(() => import("./gn")),
  fa: dynamic(() => import("./fa")),
  own: dynamic(() => import("./own")),
  driv: dynamic(() => import("./driv")),
  ee: dynamic(() => import("./ee")),
  brcc: dynamic(() => import("./brcc")),
  b1co: dynamic(() => import("./b1co")),
  eqrv: dynamic(() => import("./eqrv")),
  rv: dynamic(() => import("./rv")),
  gp: dynamic(() => import("./gp")),
  gfp: dynamic(() => import("./gfp")),
  cmap: dynamic(() => import("./cmap")),
  evt: dynamic(() => import("./evt")),
  bq: dynamic(() => import("./bq")),
  ioia: dynamic(() => import("./ioia")),
  mdw: dynamic(() => import("./mdw")),
  wvap: dynamic(() => import("./wvap")),
  rank: dynamic(() => import("./rank")),
  tp: dynamic(() => import("./tp")),
  venu: dynamic(() => import("./venu")),
  omon: dynamic(() => import("./omon")),
};

export default function StreamingPage({ params }: { params: { page: string } }) {
  const PageComponent = STREAMING_COMPONENTS[params.page];
  if (!PageComponent) return notFound();
  return <PageComponent />;
}
