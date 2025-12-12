import { type ReactNode } from "react";

const RootLayout = ({
  overview,
  children,
}: Readonly<{
  overview: ReactNode;
  children: ReactNode;
}>) => {
  return <>
  {overview}
  {children}
  </>;
};

export default RootLayout;
