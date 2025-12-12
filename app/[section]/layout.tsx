const RootLayout = ({ content, sidebar }: { content: React.ReactNode, sidebar: React.ReactNode }) => {
  return (
    <section className="grid grid-cols-12">
      <div className="col-span-2">{sidebar}</div>
      <div className="col-span-10">{content}</div>
    </section>
  );
};

export default RootLayout;
