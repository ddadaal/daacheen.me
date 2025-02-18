import { Jieba } from "@node-rs/jieba";
import { dict } from "@node-rs/jieba/dict";
import MiniSearch from "minisearch";
import { cache, Suspense } from "react";
import { ArticleListPageLayout } from "src/app/articles/ArticleListPageLayout";
import { ArticleSearchPage } from "src/app/articles/search/ArticleSearchPage";
import { countTags } from "src/app/articles/tags";
import { convertToListInfo, readArticlesCached } from "src/data/articles";
import { generateTitle } from "src/utils/metadata";

const jieba = Jieba.withDict(dict);

export interface IndexedArticleInfo {
  id: string;
}

export const generateMetadata = () => {
  return {
    title: generateTitle("Search Article"),
  };
};

const getSearchPageData = cache(async () => {
  const articles = await readArticlesCached();

  const tagCounts = countTags(articles);

  // index articles

  const allArticles = articles
    .map((x) => x.langVersions)
    .flat();

  const miniSearch = new MiniSearch<IndexedArticleInfo>({
    fields: ["title", "content", "tags"],
    storeFields: ["id"],
    tokenize: (text) => jieba.cut(text),
  });

  const articleListInfos = articles.map(convertToListInfo);

  miniSearch.addAll(allArticles);

  const index = JSON.stringify(miniSearch);

  return {
    tagCounts,
    articleCount: articles.length,
    index,
    articleListInfos,
  };
});

export default async function SearchPage() {
  const { articleCount, index, tagCounts, articleListInfos } = await getSearchPageData();

  return (
    <ArticleListPageLayout articleCount={articleCount} tagCounts={tagCounts}>
      <Suspense>
        <ArticleSearchPage
          index={index}
          articleListInfos={articleListInfos}
          articleCount={articleCount}
          tagCounts={tagCounts}
        />
      </Suspense>
    </ArticleListPageLayout>
  );
}
