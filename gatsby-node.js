// https://stackoverflow.com/questions/63124432/how-do-i-configure-mini-css-extract-plugin-in-gatsby
exports.onCreateWebpackConfig = (helper) => {
  const { stage, actions, getConfig } = helper;
  if (stage === 'develop' || stage === 'build-javascript') {
    const config = getConfig();
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin',
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    actions.replaceWebpackConfig(config);
  }
};

/**
 * event create pages
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createRedirect } = actions;

  reporter.info('createRedirect /products/* to /buy/*');
  createRedirect({
    fromPath: `/products/*`,
    toPath: `/buy/*`,
    isPermanent: true,
  });

  reporter.info('createRedirect /sitemap/sitemap-index.xml to /sitemap.xml');
  createRedirect({
    fromPath: `/sitemap.xml`,
    toPath: `https://www.activeskin.com.au/sitemap/sitemap-index.xml`,
    statusCode: 200,
    isPermanent: true,
  });
  
  const result = await graphql(`
    {
      allPrismicRedirects {
        nodes {
          data {
            redirects {
              text
            }
          }
        }
      }
    }
  `);
  if (result.errors) throw result.errors;

  const redirects =
    result?.data?.allPrismicRedirects.nodes
      .map((v) => v.data.redirects.text)
      .join('\n')
      ?.split('\n')
      ?.map((v) => v.split(' ')) || [];

  reporter.info(`Creating redirect pages ...`);

  redirects.map((redirect) => {
    // reporter.info(JSON.stringify(redirect));
    if (redirect?.length >= 2 && redirect[0]?.trim() && redirect[1]?.trim())
      createRedirect({
        fromPath: redirect[0].trim(),
        toPath: `${redirect[1].trim()}?redirect=1`,
        isPermanent: true,
      });
  });
  reporter.info(`Created ${redirects?.length} redirect pages.`);
};
