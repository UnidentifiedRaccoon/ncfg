import { handleVacancyApplicationPost } from "@/shared/lib/vacancy-application-handler";

export async function POST(request: Request) {
  return handleVacancyApplicationPost(request);
}
