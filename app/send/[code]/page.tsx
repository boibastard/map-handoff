import SendClient from "./SendClient";

export default async function SendPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <SendClient code={code.toUpperCase()} />;
}