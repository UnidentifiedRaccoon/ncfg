import { permanentRedirect } from "next/navigation";

export default function AboutHistoryRedirectPage() {
  permanentRedirect("/history");
}
