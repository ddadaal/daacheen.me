const path = require("path");

const indexTemplate = path.resolve("src/templates/ArticleListPageTemplate.tsx");
const articleTemplate = path.resolve(`src/templates/ArticlePageTemplate.tsx`);

const GitHubSlugger = require("github-slugger");

const dayjs = require("dayjs");

function createPaginatedHomepages(createPage, articleGroups) {

  const generatePath = (index) => {
    return `/articles${index === 0 ? "" : `/${index + 1}`}`;
  };

  const notIgnoredGroups = [];

  for (const key in articleGroups) {
    const node = articleGroups[key][0];
    if (!node.frontmatter.ignored) {
      notIgnoredGroups.push(node);
    }
  }

  notIgnoredGroups.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

  const pageSize = 5;

  const pageCount = Math.ceil(notIgnoredGroups.length / pageSize);

  Array.from({ length: pageCount }).forEach((_, pageIndex) => {
    createPage({
      path: generatePath(pageIndex),
      component: indexTemplate,
      context: {
        limit: pageSize,
        skip: pageIndex * pageSize,
        pageCount,
        pageIndex: pageIndex,
        ids: notIgnoredGroups.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize).map((x) => x.frontmatter.id),
      },
    })
  });

}

exports.createPages = async ({ actions, graphql }) => {

  const { createPage, createRedirect } = actions;

  const result = await graphql(`{
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
    ) {
      edges {
        node {
          frontmatter {
            id
            lang
            ignored
            date
            absolute_path
          }
          htmlAst
          headings {
            depth
            value
          }
        }
      }
    }
  }`);

  if (result.errors) {
    throw result.errors;
  }

  const articleGroups = {};
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const id = node.frontmatter.id;
    articleGroups[id] = articleGroups[id] || [];
    node.path = `${node.frontmatter.absolute_path || `/articles/${node.frontmatter.id}`}/${node.frontmatter.lang}`;
    articleGroups[id].push(node);
  });

  createPaginatedHomepages(
    createPage,
    articleGroups,
  );

  const slugger = new GitHubSlugger();

  Object.values(articleGroups).forEach((nodes) => {
    let indexPageCreated = false; // indicates whether the index path (the path not containing lang) is created
    nodes.forEach((node) => {
      slugger.reset();
      const path = node.path;
      createPage({
        path,
        component: articleTemplate,
        context: {
          id: node.frontmatter.id,
          lang: node.frontmatter.lang,
          htmlAst: node.htmlAst,
          headings: node.headings.map((x) => ({
            ...x,
            slug: slugger.slug(x.value),
          })),
        }
      });

      if (!indexPageCreated) {
        slugger.reset();
        const paths = node.path.split("/");
        paths.pop();
        const path = paths.join("/");

        createRedirect({
          fromPath: path,
          toPath: node.path,
          isPermanent: true,
          redirectInBrowser: true,
        });

        createRedirect({
          fromPath: path + "/",
          toPath: node.path,
          isPermanent: true,
          redirectInBrowser: true,
        });

        indexPageCreated = true;
      }
    });
  });
};
