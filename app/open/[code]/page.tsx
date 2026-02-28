import OpenClient from "./OpenClient";

export default async function OpenPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <OpenClient code={code.toUpperCase()} />;
}