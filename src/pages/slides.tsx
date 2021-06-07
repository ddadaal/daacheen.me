import React from "react";
import { graphql } from "gatsby";
import BannerLayout, {
  BannerLayoutTitle,
  BannerLayoutDescription,
} from "@/layouts/BannerLayout";
import styled from "styled-components";
import { prefix, useI18n } from "@/i18n";
import Page from "@/layouts/Page";
import { FaGithub } from "react-icons/fa";
import { Slide } from "@/models/Slide";
import { colors } from "@/styles/variables";
import { groupBy } from "@/utils/groupBy";
import useConstant from "@/utils/useConstant";
import { PageMetadata } from "@/components/PageMetadata";

interface Props {
  data: {
    allSlide: {
      nodes: { name: string; html_url: string }[];
    };
  };
}

const Slides: React.FC<Props> = (props) => {
  const { data: { allSlide: { nodes } } } = props;

  const i18n = useI18n();

  const title = i18n.translate("resources.slides.title") as string;
  const description = i18n.translate("resources.slides.description") as string;

  const sortedData = useConstant(() => {
    const map = groupBy(nodes.map(({ name, html_url }) => ({
      year: name.substr(0, 4),
      date: `${name.substr(0, 4)}/${name.substr(4, 2)}/${name.substr(6, 2)}`,
      name: name.substring(9),
      githubUrl: html_url,
    } as Slide)), (data) => data.year);

    // to sorted array
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  });

  return (
    <BannerLayout transparentHeader={false} banner={
      <>
        <BannerLayoutTitle>{title}</BannerLayoutTitle>
        <BannerLayoutDescription>{description}</BannerLayoutDescription>
      </>
    }
    >
      <PageMetadata
        title={title}
        description={description}
      />
      <Page maxWidth={700}>
        <p>{i18n.translate("resources.slides.autoGenerated", [
          <a key={"link"} href={"https://github.com/ddadaal/Slides"}>
            <FaGithub />ddadaal/Slides
          </a>,
        ])}</p>
        {
          sortedData.map(([year, pres]) => {
            return (
              <Year key={year}>
                <YearNode>{year}</YearNode>
                {pres.sort((a, b) => b.date.localeCompare(a.date)).map((pre) => (
                  <PreNode key={pre.date}>
                    <PreNodeName href={pre.githubUrl} target={"__blank"}>
                      {pre.name}
                    </PreNodeName>
                    <PreNodeDate>{pre.date}</PreNodeDate>
                  </PreNode>
                ))}
              </Year>
            );
          })
        }
      </Page>
    </BannerLayout>
  );
};

export default Slides;


const Year = styled.div`
  border-left: 1px lightgray solid;
  padding: 8px 0;
`;

const YearNode = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-left: 0px;

  padding: 0 8px;

  border-left: 4px ${colors.tocLinkActiveColor} solid;

`;

const PreNode = styled.div`
  margin-bottom: 8px;
    padding: 0 8px;

`;

const PreNodeDate = styled.span`
  color: gray;
  font-size: small;
`;

const PreNodeName = styled.a`
  display: block;
`;

export const query = graphql`
  query Slides {
    allSlide(filter: {type: { eq: "dir" }}) {
      nodes {
        name
        html_url
        type
      }
    }
  }
`;
