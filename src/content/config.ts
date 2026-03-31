import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    excerpt: z.string().optional(),
    draft: z.boolean().optional().default(false),
    ai_translated: z.boolean().optional().default(false),
    lang: z.enum(["ja", "en", "zh"]),
    postSlug: z.string(),
  }),
});

export const collections = { blog };
