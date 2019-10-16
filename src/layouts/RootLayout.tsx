import React from "react";
import I18nStore from "@/stores/I18nStore";
import LocationStore, { LocationProvider } from "@/stores/LocationStore";
import { SiteMetadata } from "@/models/SiteMetadata";
import MetadataStore from "@/stores/MetadataStore";
import { IconContext } from "react-icons";
import styled from "styled-components";
import icon512 from "~/assets/icon.png";
import UpdatePop from "@/components/UpdatePop";
import { StoreProvider, createStore } from "simstate";
import ArticleStore from "@/stores/ArticleStore";
import ToTop from "@/components/ToTop";
import "@/styles/index.scss";
import { ArticleNode } from "@/models/ArticleNode";
import useConstant from "@/utils/useConstant";
import { PageMetadata } from "@/components/PageMetadata";

const LayoutRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  word-wrap: break-word;
`;

interface Props {
  location: Location;
  articles: ArticleNode[];
  siteMetadata: SiteMetadata;
  children?: React.ReactNode;
  tagMap: TagMap;
}

const iconContext = { className: "icons" };

const RootLayout: React.FC<Props> = ({ location, articles, siteMetadata, tagMap, children }) => {

  const i18nStore = useConstant(() => createStore(I18nStore));

  const locationStore = useConstant(() => createStore(LocationStore, location));

  const metadataStore = useConstant(() => createStore(MetadataStore,
    siteMetadata,
    articles,
    tagMap,
  ));

  const articleStore = useConstant(() => createStore(ArticleStore, null));

  return (
    <IconContext.Provider value={iconContext}>
      <StoreProvider stores={[
        locationStore,
        i18nStore,
        metadataStore,
        articleStore,
      ]}>
        <LocationProvider location={location} />
        <LayoutRoot>
          <PageMetadata
            meta={[
              { name: "keywords", content: "gatsbyjs, gatsby, react, daacheen, blog" },
              { name: "author", content: "daacheen" },
            ]}
            link={[
              { rel: "icon", type: "image/png", href: icon512 },
              { rel: "shortcut icon", type: "image/png", href: icon512 },
            ]}
            script={[
              {
                type: "text/javascript",
                src: "https://s5.cnzz.com/z_stat.php?id=1276500124&web_id=1276500124",
                async: true,
              },
            ]}
          />
          <UpdatePop />
          <ToTop />
          {children}
        </LayoutRoot>
      </StoreProvider>
    </IconContext.Provider>
  );
}

export default RootLayout;
