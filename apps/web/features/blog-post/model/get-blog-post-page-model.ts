import {
  fetchNewsArticle,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { makeFooterData } from "@/shared/lib/footer-data";

export async function getBlogPostPageModel(slug: string) {
  const [siteSetting, post, allPosts] = await Promise.all([
    fetchSiteSettings(),
    fetchNewsArticle(slug),
    fetchNewsArticles(),
  ]);

  return {
    post,
    allPosts,
    footerData: makeFooterData(siteSetting),
  };
}

