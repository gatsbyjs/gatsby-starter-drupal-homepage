const { getGatsbyImageResolver } = require("gatsby-plugin-image/graphql-utils")

const formatAsNodeType = (str) => {
  const base = str.replace("node__", "")
  const type = base
    .split("_")
    .map(
      (section) =>
        `${section.substring(0, 1).toUpperCase()}${section.substring(1)}`
    )
    .join("")
  const internalType = base.toLowerCase()
  return [type, internalType]
}

exports.createSchemaCustomization = async ({ actions }) => {
  actions.createFieldExtension({
    name: "blocktype",
    extend(options) {
      return {
        resolve(source) {
          return formatAsNodeType(source.internal.type)[0]
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "imagePassthroughArgs",
    extend(options) {
      const { args } = getGatsbyImageResolver()
      return {
        args,
      }
    },
  })

  actions.createFieldExtension({
    name: "imageUrl",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const fieldMediaImage = context.nodeModel.getNodeById({
            id: source.relationships.field_media_image___NODE,
          })
          const localFile = context.nodeModel.getNodeById({
            id: fieldMediaImage.localFile___NODE,
          })
          return localFile.url
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "imagePassthroughResolver",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const imageType = info.schema.getType("ImageSharp")
          const fieldMediaImage = context.nodeModel.getNodeById({
            id: source.relationships.field_media_image___NODE,
          })
          const localFile = context.nodeModel.getNodeById({
            id: fieldMediaImage.localFile___NODE,
          })
          const image = context.nodeModel.getNodeById({
            id: localFile.children[0],
          })
          const resolver = imageType.getFields().gatsbyImageData.resolve
          if (!resolver) return null
          return await resolver(image, args, context, info)
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "navItemType",
    args: {
      name: {
        type: "String!",
        defaultValue: "Link",
      },
    },
    extend(options) {
      return {
        resolve() {
          switch (options.name) {
            case "Group":
              return "Group"
            default:
              return "Link"
          }
        },
      }
    },
  })

  // abstract interfaces
  actions.createTypes(/* GraphQL */ `
    interface HomepageBlock implements Node {
      id: ID!
      blocktype: String
    }

    interface HomepageLink implements Node {
      id: ID!
      href: String
      text: String
    }

    interface HeaderNavItem implements Node {
      id: ID!
      navItemType: String
    }

    interface NavItem implements Node & HeaderNavItem {
      id: ID!
      navItemType: String
      href: String
      text: String
      icon: HomepageImage
      description: String
    }

    interface NavItemGroup implements Node & HeaderNavItem {
      id: ID!
      navItemType: String
      name: String
      navItems: [NavItem]
    }

    interface HomepageImage implements Node {
      id: ID!
      alt: String
      gatsbyImageData: GatsbyImageData @imagePassthroughArgs
      url: String
    }

    interface HomepageHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      subhead: String
      image: HomepageImage
      text: String
      links: [HomepageLink]
    }

    interface HomepageFeature implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      text: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageFeatureList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      content: [HomepageFeature]
    }

    interface HomepageCta implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      kicker: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageLogo implements Node {
      id: ID!
      image: HomepageImage
      alt: String
    }

    interface HomepageLogoList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      name: String
      text: String
      logos: [HomepageLogo]
    }

    interface HomepageTestimonial implements Node {
      id: ID!
      quote: String
      source: String
      avatar: HomepageImage
    }

    interface HomepageTestimonialList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      content: [HomepageTestimonial]
    }

    interface HomepageBenefit implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage
    }

    interface HomepageBenefitList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      content: [HomepageBenefit]
    }

    interface HomepageStat implements Node {
      id: ID!
      value: String
      label: String
      heading: String
    }

    interface HomepageStatList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      text: String
      image: HomepageImage
      icon: HomepageImage
      content: [HomepageStat]
      links: [HomepageLink]
    }

    interface HomepageProduct implements Node {
      id: ID!
      heading: String
      text: String
      image: HomepageImage
      links: [HomepageLink]
    }

    interface HomepageProductList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      kicker: String
      text: String
      content: [HomepageProduct]
    }

    interface Homepage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage
      content: [HomepageBlock]
    }

    interface LayoutHeader implements Node {
      id: ID!
      navItems: [HeaderNavItem]
      cta: HomepageLink
    }

    enum SocialService {
      TWITTER
      FACEBOOK
      INSTAGRAM
      YOUTUBE
      LINKEDIN
      GITHUB
      DISCORD
      TWITCH
    }

    interface SocialLink implements Node {
      id: ID!
      username: String!
      service: SocialService!
    }

    interface LayoutFooter implements Node {
      id: ID!
      links: [HomepageLink]
      meta: [HomepageLink]
      socialLinks: [SocialLink]
      copyright: String
    }

    interface Layout implements Node {
      id: ID!
      header: LayoutHeader
      footer: LayoutFooter
    }

    interface AboutPage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage
      content: [HomepageBlock]
    }

    interface AboutHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      text: String
      image: HomepageImage
    }

    interface AboutStat implements Node {
      id: ID!
      value: String
      label: String
    }

    interface AboutStatList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      content: [AboutStat]
    }

    interface AboutProfile implements Node {
      id: ID!
      image: HomepageImage
      name: String
      jobTitle: String
    }

    interface AboutLeadership implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      kicker: String
      heading: String
      subhead: String
      content: [AboutProfile]
    }

    interface AboutLogoList implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String
      links: [HomepageLink]
      logos: [HomepageLogo]
    }

    interface Page implements Node {
      id: ID!
      slug: String!
      title: String
      description: String
      image: HomepageImage
      html: String!
      body: node__pageField_body
    }
  `)

  // CMS-specific types
  actions.createTypes(/* GraphQL */ `
    type node__homepage_link implements Node & HomepageLink @dontInfer {
      id: ID!
      href: String @proxy(from: "field_href")
      text: String @proxy(from: "title")
    }

    type node__nav_item implements Node & NavItem & HeaderNavItem @dontInfer {
      id: ID!
      navItemType: String @navItemType(name: "Link")
      href: String @proxy(from: "field_href")
      text: String @proxy(from: "title")
      icon: HomepageImage
        @link(by: "id", from: "relationships.field_icon___NODE")
      description: String @proxy(from: "field_description")
    }

    type node__nav_item_group implements Node & NavItemGroup & HeaderNavItem
      @dontInfer {
      id: ID!
      navItemType: String @navItemType(name: "Group")
      name: String @proxy(from: "title")
      navItems: [NavItem]
        @link(by: "id", from: "relationships.field_nav_items___NODE")
    }

    type media__image implements Node & HomepageImage {
      id: ID!
      alt: String @proxy(from: "field_media_image.alt")
      gatsbyImageData: GatsbyImageData
        @imagePassthroughResolver
        @imagePassthroughArgs
      url: String @imageUrl
      title: String
    }

    type node__homepage_hero implements Node & HomepageHero & HomepageBlock {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      subhead: String @proxy(from: "field_subhead")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      text: String @proxy(from: "field_text")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_feature implements Node & HomepageBlock & HomepageFeature
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }
    type node__homepage_feature_list implements Node & HomepageBlock & HomepageFeatureList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      content: [HomepageFeature]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage_cta implements Node & HomepageBlock & HomepageCta
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      kicker: String @proxy(from: "field_kicker")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_logo implements Node & HomepageLogo @dontInfer {
      id: ID!
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      alt: String @proxy(from: "title")
    }

    type node__homepage_logo_list implements Node & HomepageBlock & HomepageLogoList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      name: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      logos: [HomepageLogo]
        @link(by: "id", from: "relationships.field_logos___NODE")
    }

    type node__homepage_testimonial implements Node & HomepageTestimonial
      @dontInfer {
      id: ID!
      quote: String @proxy(from: "field_quote")
      source: String @proxy(from: "title")
      avatar: HomepageImage
        @link(by: "id", from: "relationships.field_avatar___NODE")
    }

    type node__homepage_testimonial_list implements Node & HomepageBlock & HomepageTestimonialList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      content: [HomepageTestimonial]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage_benefit implements Node & HomepageBenefit @dontInfer {
      id: ID!
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
    }

    type node__homepage_benefit_list implements Node & HomepageBlock & HomepageBenefitList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "field_heading")
      text: String @proxy(from: "field_text")
      content: [HomepageBenefit]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage_stat implements Node & HomepageBlock & HomepageStat
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "field_heading")
      label: String @proxy(from: "field_label")
      value: String @proxy(from: "title")
    }

    type node__homepage_stat_list implements Node & HomepageBlock & HomepageStatList
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      icon: HomepageImage
        @link(by: "id", from: "relationships.field_icon___NODE")
      content: [HomepageStat]
        @link(by: "id", from: "relationships.field_content___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_product implements Node & HomepageProduct @dontInfer {
      id: ID!
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
    }

    type node__homepage_product_list implements Node & HomepageProductList & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      kicker: String @proxy(from: "field_kicker")
      text: String @proxy(from: "field_text")
      content: [HomepageProduct]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__homepage implements Node & Homepage @dontInfer {
      id: ID!
      title: String
      description: String @proxy(from: "field_description")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      content: [HomepageBlock]
        @link(by: "id", from: "relationships.field_content___NODE")
    }
  `)

  // CMS specific types for About page
  actions.createTypes(/* GraphQL */ `
    type node__about_hero implements Node & AboutHero & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      text: String @proxy(from: "field_text")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
    }

    type node__about_stat implements Node & AboutStat @dontInfer {
      id: ID!
      value: String @proxy(from: "title")
      label: String @proxy(from: "field_label")
    }

    type node__about_stat_list implements Node & AboutStatList & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      content: [AboutStat]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__about_profile implements Node & AboutProfile @dontInfer {
      id: ID!
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      name: String @proxy(from: "title")
      jobTitle: String @proxy(from: "field_job_title")
    }

    type node__about_leadership implements Node & AboutLeadership & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      kicker: String @proxy(from: "field_kicker")
      heading: String @proxy(from: "title")
      subhead: String @proxy(from: "field_subhead")
      content: [AboutProfile]
        @link(by: "id", from: "relationships.field_content___NODE")
    }

    type node__about_logo_list implements Node & AboutLogoList & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String @proxy(from: "title")
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
      logos: [HomepageLogo]
        @link(by: "id", from: "relationships.field_logos___NODE")
    }

    type node__about_page implements Node & AboutPage @dontInfer {
      id: ID!
      title: String
      description: String @proxy(from: "field_description")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      content: [HomepageBlock]
        @link(by: "id", from: "relationships.field_content___NODE")
    }
  `)

  // Layout types
  actions.createTypes(/* GraphQL */ `
    type node__layout_header implements Node & LayoutHeader @dontInfer {
      id: ID!
      navItems: [HeaderNavItem]
        @link(by: "id", from: "relationships.field_nav_items___NODE")
      cta: HomepageLink @link(by: "id", from: "relationships.field_cta___NODE")
    }

    type node__social_link implements Node & SocialLink @dontInfer {
      id: ID!
      blocktype: String @blocktype
      username: String! @proxy(from: "field_username")
      service: SocialService! @proxy(from: "title")
    }

    type node__layout_footer implements Node & LayoutFooter @dontInfer {
      id: ID!
      links: [HomepageLink]
        @link(by: "id", from: "relationships.field_links___NODE")
      meta: [HomepageLink]
        @link(by: "id", from: "relationships.field_meta___NODE")
      socialLinks: [SocialLink]
        @link(by: "id", from: "relationships.field_social_links___NODE")
      copyright: String @proxy(from: "field_copyright")
    }

    type node__layout implements Node & Layout @dontInfer {
      id: ID!
      header: LayoutHeader
        @link(by: "id", from: "relationships.field_header___NODE")
      footer: LayoutFooter
        @link(by: "id", from: "relationships.field_footer___NODE")
    }

    type node__pageField_body {
      value: String @proxy(from: "field_value")
      processed: String @proxy(from: "field_processed")
      format: String @proxy(from: "field_format")
    }
  `)

  // Page types
  actions.createTypes(/* GraphQL */ `
    type node__page implements Node & Page @dontInfer {
      id: ID!
      slug: String! @proxy(from: "field_slug")
      title: String
      description: String @proxy(from: "field_description")
      image: HomepageImage
        @link(by: "id", from: "relationships.field_image___NODE")
      html: String! @proxy(from: "field_body.processed")
      body: node__pageField_body @proxy(from: "field_body")
    }
  `)
}

exports.createPages = ({ actions }) => {
  const { createSlice } = actions
  createSlice({
    id: "header",
    component: require.resolve("./src/components/header.js"),
  })
  createSlice({
    id: "footer",
    component: require.resolve("./src/components/footer.js"),
  })
}
      