/**
 * Deploy to Sanity Studio — these are schema definitions for reference.
 *
 * Landing Page document type.
 * A singleton document (slug: "home") that powers the public-facing
 * landing page. All user-facing text is trilingual (Hebrew, English, Yiddish)
 * with RTL support for Hebrew and Yiddish.
 */

/**
 * Reusable helper for a trilingual string field object.
 * @param {string} name
 * @param {string} title
 * @param {boolean} [required]
 */
const trilingualString = (name, title, required = false) => ({
  name,
  title,
  type: 'object',
  fields: [
    {
      name: 'he',
      title: 'Hebrew (עברית)',
      type: 'string',
      validation: required ? (Rule) => Rule.required() : undefined,
    },
    { name: 'en', title: 'English', type: 'string' },
    { name: 'yi', title: 'Yiddish (ייִדיש)', type: 'string' },
  ],
});

/**
 * Reusable helper for a trilingual text (multi-line) field object.
 * @param {string} name
 * @param {string} title
 */
const trilingualText = (name, title) => ({
  name,
  title,
  type: 'object',
  fields: [
    { name: 'he', title: 'Hebrew (עברית)', type: 'text', rows: 3 },
    { name: 'en', title: 'English', type: 'text', rows: 3 },
    { name: 'yi', title: 'Yiddish (ייִדיש)', type: 'text', rows: 3 },
  ],
});

export default {
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    // -------------------------------------------------------------------------
    // Slug (should be "home" for the main landing page)
    // -------------------------------------------------------------------------
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'internalName', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'internalName',
      title: 'Internal Name',
      type: 'string',
      description: 'Used only in the CMS (e.g. "Home Landing Page")',
    },

    // -------------------------------------------------------------------------
    // Hero Section
    // -------------------------------------------------------------------------
    {
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        trilingualString('title', 'Hero Title', true),
        trilingualString('subtitle', 'Hero Subtitle'),
        trilingualString('ctaText', 'CTA Button Text'),
        {
          name: 'image',
          title: 'Hero Image',
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Features
    // -------------------------------------------------------------------------
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon Name (Lucide)',
              type: 'string',
              description: 'Lucide icon name, e.g. "BookOpen", "Star", "Wand2"',
            },
            trilingualString('title', 'Feature Title', true),
            trilingualText('description', 'Feature Description'),
          ],
          preview: {
            select: { title: 'title.he', subtitle: 'title.en' },
          },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Testimonials
    // -------------------------------------------------------------------------
    {
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            trilingualText('quote', 'Quote'),
            { name: 'authorName', title: 'Author Name', type: 'string' },
            { name: 'authorRole', title: 'Author Role / Title', type: 'string' },
            {
              name: 'authorImage',
              title: 'Author Image',
              type: 'image',
              options: { hotspot: true },
            },
          ],
          preview: {
            select: { title: 'authorName', subtitle: 'authorRole' },
          },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Pricing
    // -------------------------------------------------------------------------
    {
      name: 'pricing',
      title: 'Pricing Plans',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'planName', title: 'Plan Name', type: 'string' },
            trilingualText('description', 'Plan Description'),
            { name: 'price', title: 'Price (numeric)', type: 'number' },
            {
              name: 'currency',
              title: 'Currency Code',
              type: 'string',
              initialValue: 'ILS',
              description: 'ISO 4217 currency code, e.g. ILS, USD, EUR',
            },
            {
              name: 'features',
              title: 'Feature List (Trilingual)',
              type: 'object',
              description: 'One array of strings per language',
              fields: [
                { name: 'he', title: 'Hebrew (עברית)', type: 'array', of: [{ type: 'string' }] },
                { name: 'en', title: 'English', type: 'array', of: [{ type: 'string' }] },
                { name: 'yi', title: 'Yiddish (ייִדיש)', type: 'array', of: [{ type: 'string' }] },
              ],
            },
            {
              name: 'highlighted',
              title: 'Highlighted (recommended plan)',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'planName', subtitle: 'price' },
          },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Stats
    // -------------------------------------------------------------------------
    {
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Value (e.g. "10,000+")', type: 'string' },
            trilingualString('label', 'Label'),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label.he' },
          },
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'internalName',
      subtitle: 'slug.current',
    },
  },
};
