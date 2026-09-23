import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['prototype', 'production', 'concept']),
    statusLabel: z.string(),
    stack: z.array(z.string()),
    stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    videoUrl: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    publishDate: z.date(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = {
  'case-studies': caseStudies
};
