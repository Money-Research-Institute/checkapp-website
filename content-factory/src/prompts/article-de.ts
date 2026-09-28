import type { ArticleRequest } from './types';
import { clusterTagEn } from '../../config/cluster-tags';
import { REQUIRED_DISCLAIMER_TEXT, SAFE_LIMITS_SENTENCE } from './system';

export function buildArticlePrompt(
  req: ArticleRequest,
  images: Array<{ url: string; altText: string }>,
  internalLinks: Array<{ slug: string; text: string }>,
): string {
  const imgMarkdown = images
    .slice(1)
    .map((img, i) => `Body image ${i + 1}: ![${img.altText}](${img.url})`)
    .join('\n');

  const internalLinksText = internalLinks
    .map((l) => `- [${l.text}](/blog/${l.slug}/)`)
    .join('\n');

  const authorName = req.author?.name ?? 'Ed Musinski';
  const authorRole = req.author?.role ?? 'Chief Science Consultant';
  const coverUrl = images[0]?.url?.replace('w=800', 'w=1200') ?? '';
  const title = req.titleEn || req.titleDe;
  const keyword = req.keywordEn || req.keywordDe;
  const readTimeEstimate = Math.max(6, Math.ceil(req.targetLength / 200));

  return `
Write a complete English educational article for the CheckApp wellness blog. No medical claims.

## ARTICLE PARAMETERS
- **Slug:** ${req.slug}
- **Title:** ${title}
- **Primary keyword:** "${keyword}" (target density: 0.8–1.2%)
- **LSI keywords:** ${req.lsiKeywords.join(', ')}
- **Format:** ${req.format}
- **Target word count:** ${req.targetLength} words
- **Category:** ${req.category} (one of: Hydration Science, AI & Health, Daily Habits, 4P Medicine, Preventive Care)
- **Audience:** ${getSegmentDesc(req.taSegments)}

## IMAGES
- Do **not** paste the cover image (\`coverImage\` in frontmatter) into the body. The site already renders it above the article.
- Place remaining images later in the body, after at least one H2.
${imgMarkdown || '- (no extra body images)'}

## INTERNAL LINKS
Embed 2–3 as inline mentions only if they fit. Also link to /features or /how-it-works where natural.

${internalLinksText || '(none — skip internal blog links)'}

## AUTHORITATIVE EXTERNAL SOURCES (use where relevant)
- WHO: https://www.who.int
- NIH: https://www.nih.gov
- PubMed: https://pubmed.ncbi.nlm.nih.gov
- CDC wellness: https://www.cdc.gov

## REQUIRED CONTENTS

### 1. Frontmatter (exactly this shape)
\`\`\`
---
title: "${title}"
description: "[150–160 characters, keyword '${keyword}', no medical claims]"
datePublished: "${req.plannedDate}"
dateModified: "${req.plannedDate}"
author:
  name: "${authorName}"
  role: "${authorRole}"
category: "${req.category}"
readTime: ${readTimeEstimate}
coverImage: "${coverUrl}"
featured: false
checkedBy: "Sam Okonkwo, Registered Dietitian"
tags: ["${keyword}", "${clusterTagEn(req.cluster)}", "wellness", "2026"]
faq:
  - question: "..."
    answer: "..."
sources:
  - label: "WHO"
    url: "https://www.who.int/..."
---
\`\`\`

### 2. Article structure (required)
- Intro: hook + core answer in the first 150 words (GEO). Start with the topic, not a compliance dump.
- Do **not** repeat the cover image in the body
- At least 5 H2 headings phrased as questions
- At least 1 data table
- At least 1 numbered list (5+ items)
- One in-body image (not the cover) mid-article
- Limits section — copy this sentence and stay with signals / indicators:
  ${SAFE_LIMITS_SENTENCE}
- Practical checklist or how-to
- Closing CTA, verbatim:
  Try CheckApp free — DIDI turns daily wellness advice into a habit you actually keep. [Get CheckApp Free](/download/)
- Required italic disclaimer, verbatim:
  ${REQUIRED_DISCLAIMER_TEXT}
- **Do not** add a "Further reading" section

### 3. FAQ
At least 5 questions in frontmatter. First question must be the most common search query for "${keyword}".
FAQ answers describe habits and limits. The first FAQ must not ask whether the app diagnoses a condition.

## FEW-SHOT (limits + disclaimer)
Safe paragraph:
Thirst, urine color, and afternoon energy are hydration signals you can notice at home. ${SAFE_LIMITS_SENTENCE}

Safe FAQ answer:
No. CheckApp and DIDI support daily habits and wellness indicators. ${SAFE_LIMITS_SENTENCE}

Unsafe (do not write these strings anywhere, including headings and FAQ):
- "diagnoses dehydration" / "detects disease" / "identifies illness" / "medical diagnosis of"
- "you have diabetes" / "you have dehydration" / "you have been diagnosed"
- "cures disease" / "treats cancer" / "prescribes medication"
- "FDA-approved" / "replaces your doctor" / "guaranteed to cure" / "100% accurate diagnosis"

## FORBIDDEN PATTERNS (AGAIN)
- ❌ {#anchor-id}
- ❌ [Section](#anchor)
- ❌ <AnyJSXComponent>
- ❌ <script>
- ❌ # H1 in the body
- ❌ ---en---
- ❌ titleEn / descriptionEn / tagsEn
- ❌ readTime: "8 min" (must be a number)
- ❌ diagnosis, prescription, cure, or guaranteed-outcome claims listed above

Write the complete article now. Start directly with the three dashes (---) of the frontmatter.
`;
}

function getSegmentDesc(segments: string[]): string {
  const map: Record<string, string> = {
    beginners: 'people starting a daily wellness routine',
    athletes: 'active adults tracking hydration and recovery',
    professionals: 'busy professionals building micro-habits',
    parents: 'parents modeling healthy habits for family',
    seniors: 'older adults focused on preventive wellness',
    'health-curious': 'readers exploring AI wellness tools without medical jargon',
  };
  return segments.map((s) => map[s] || s).join(', ');
}
