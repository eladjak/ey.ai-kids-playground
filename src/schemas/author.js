/**
 * Deploy to Sanity Studio — these are schema definitions for reference.
 *
 * Author document type.
 * Represents a blog post author with a name, avatar image, and short bio.
 */

export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
};
