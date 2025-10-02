import { dbConnectionStatus } from "@/db/connection-status";

export default async function Home() {
  const result = await dbConnectionStatus();
  console.log(result);
  return (
    <div className="flex min-h-screen flex-col">
      hello
    </div>
  );
}
