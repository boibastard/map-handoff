import { redirect } from "next/navigation";

export default async function CodeRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/open/${code.toUpperCase()}`);
}