import { searchCourse } from "@/lib/search";

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  const trimmed = query.trim().slice(0, 80);
  if (!trimmed) return Response.json({ results: [] });

  try {
    return Response.json({ results: searchCourse(trimmed) });
  } catch {
    return Response.json({ error: "search-failed" }, { status: 500 });
  }
}
