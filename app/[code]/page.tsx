import { redirect } from "next/navigation";

const RESERVED_ROUTES = ["open", "send", "api"];

export default async function CodeRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const cleanCode = code?.trim();

  if (!cleanCode) {
    redirect("/");
  }

  const lowerCode = cleanCode.toLowerCase();

  if (RESERVED_ROUTES.includes(lowerCode)) {
    redirect("/");
  }

  redirect(`/open/${cleanCode.toUpperCase()}`);
}