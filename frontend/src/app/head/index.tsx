import { Helmet } from "react-helmet";

import { useGetArgumentRouteQuery } from "../../graphql/generated";
import { useLanguage } from "../../providers/language";
import getEnvironmentVariable from "../../utilities/get-environment";

const VITE_SITE_TITLE = getEnvironmentVariable("VITE_SITE_TITLE", "");
const VITE_SITE_DESCRIPTION = getEnvironmentVariable(
  "VITE_SITE_DESCRIPTION",
  ""
);
const VITE_DOMAIN_STAGED = getEnvironmentVariable("VITE_DOMAIN_STAGED", "");

/**
 *
 * @param root0 - props
 */
function Head({ id }: { id: string | undefined }) {
  const { language } = useLanguage();

  const siteTitle = language.translations?.siteTitle ?? VITE_SITE_TITLE;
  const siteDescription =
    language.translations?.siteDescription ?? VITE_SITE_DESCRIPTION;

  const { data } = useGetArgumentRouteQuery({
    variables: { argumentId: Number(id) },
    skip: Number.isNaN(Number(id)),
  });

  const pageSubtitle = data?.getArgumentRoute?.subtitle;
  const pageTitle = data?.getArgumentRoute?.title;

  const subContent = pageSubtitle ?? siteDescription;
  const content =
    pageTitle !== undefined && pageTitle !== ""
      ? `${pageTitle} | ${siteTitle}`
      : siteTitle;

  const idIs = id !== undefined && id !== "";

  const href = idIs
    ? `${VITE_DOMAIN_STAGED}/${language.value}/${id}`
    : `${VITE_DOMAIN_STAGED}/${language.value}`;

  const type = idIs ? "article" : "website";

  return (
    <Helmet>
      <html lang={language.value} dir={language.direction} />
      <meta name="description" content={siteDescription} />
      <title>{content}</title>
      <link rel="canonical" href={href} />
      <meta property="og:url" content={href} />
      <meta property="og:title" content={content} />
      <meta property="og:description" content={subContent} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={content} />
      <meta name="twitter:description" content={subContent} />
    </Helmet>
  );
}

export default Head;
