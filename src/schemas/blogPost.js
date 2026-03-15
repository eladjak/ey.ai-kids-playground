/**
 * Deploy to Sanity Studio — Blog Post document type.
 *
 * This schema matches the actual post type in your Sanity project:
 * - Posts are filtered by siteId to separate content between sites
 * - EY.AI Kids Playground uses siteId: "eyai-kids"
 * - Title, excerpt, and body are plain strings (not trilingual in actual schema)
 * - Language field allows filtering posts by language (he/en)
 */

export default {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // -------------------------------------------------------------------------
    // Basic Fields
    // -------------------------------------------------------------------------
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },

    // -------------------------------------------------------------------------
    // Content
    // -------------------------------------------------------------------------
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    },

    // -------------------------------------------------------------------------
    // Metadata & Taxonomy
    // -------------------------------------------------------------------------
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    },
    {
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
    },

    // -------------------------------------------------------------------------
    // Site & Language Separation
    // -------------------------------------------------------------------------
    {
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      initialValue: 'eyai-kids',
      description: 'Identifies which site/project this post belongs to (e.g., "eyai-kids")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Hebrew (עברית)', value: 'he' },
          { title: 'English', value: 'en' },
          { title: 'Yiddish (ייִדיש)', value: 'yi' },
        ],
      },
      description: 'Post language for filtering',
    },

    // -------------------------------------------------------------------------
    // Status & Publishing
    // -------------------------------------------------------------------------
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    },

    // -------------------------------------------------------------------------
    // SEO
    // -------------------------------------------------------------------------
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },
  ],

  // ---------------------------------------------------------------------------
  // Ordering in Sanity Studio
  // ---------------------------------------------------------------------------
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'excerpt',
      media: 'mainImage',
    },
  },
};
