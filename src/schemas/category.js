/**
 * Deploy to Sanity Studio — these are schema definitions for reference.
 *
 * Category document type.
 * Used to tag blog posts. Titles and descriptions are trilingual
 * (Hebrew, English, Yiddish) matching the app's i18n setup.
 */

export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Title (Trilingual)',
      type: 'object',
      fields: [
        {
          name: 'he',
          title: 'Hebrew (עברית)',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'en',
          title: 'English',
          type: 'string',
        },
        {
          name: 'yi',
          title: 'Yiddish (ייִדיש)',
          type: 'string',
        },
      ],
    },
    {
      name: 'description',
      title: 'Description (Trilingual)',
      type: 'object',
      fields: [
        {
          name: 'he',
          title: 'Hebrew (עברית)',
          type: 'text',
          rows: 3,
        },
        {
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 3,
        },
        {
          name: 'yi',
          title: 'Yiddish (ייִדיש)',
          type: 'text',
          rows: 3,
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title.he',
      subtitle: 'title.en',
    },
  },
};
