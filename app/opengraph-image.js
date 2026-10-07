import { ogContentType, ogSize, ogSubtitle, renderOgImage } from "@/lib/og-image";
import { courseName, SITE_DESCRIPTION } from "@/lib/seo";

export const alt = courseName();
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    kicker: "คอร์ส",
    title: courseName(),
    subtitle: ogSubtitle(SITE_DESCRIPTION),
  });
}
