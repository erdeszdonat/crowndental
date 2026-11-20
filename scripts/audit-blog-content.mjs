import { articleTranslations, oldArticleSlugs as SLUG_MIGRATIONS, mergedArticleSlugs as MERGE_TARGETS } from '../lib/blogRouteData.mjs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SITE_URL = 'https://www.crowndental.hu';
const LOCALES = ['hu', 'sk', 'en', 'de'];

function csvCell(value) {
  const rawValue = String(value ?? '');
  // Prevent spreadsheet applications from interpreting CMS-controlled text
  // as a formula when the audit CSV is opened.
  const stringValue = /^[=+\-@\t\r]/.test(rawValue) ? `'${rawValue}` : rawValue;
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function postUrl(language, slug) {
  const prefix = language === 'hu' ? '' : `/${language}`;
  return `${SITE_URL}${prefix}/blog/${slug}`;
}

async function fetchPosts() {
  const query = `*[_type == "post"] | order(language asc, publishedAt desc){
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    "language": coalesce(language, "hu"),
    "category": coalesce(category, "professional"),
    publishedAt,
    excerpt,
    seoTitle,
    seoDescription,
    authorName,
    authorRole,
    authorProfileUrl,
    medicalReviewerName,
    medicalReviewerRole,
    "wordCount": round(length(pt::text(content)) / 5)
  }`;
  const url = new URL(`https://${PROJECT_ID}.api.sanity.io/v2024-03-08/data/query/${DATASET}`);
  url.searchParams.set('query', query);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sanity query failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  return payload.result || [];
}

function assessPost(post, group) {
  const issues = [];
  let score = 100;

  // A felhasználó szerkesztőségi döntése alapján a Crown Dental a tartalom
  // szervezeti kiadója. Név szerinti orvosi reviewer nem auditkövetelmény.
  if (!post.seoTitle) {
    issues.push('Hiányzik a SEO title');
    score -= 10;
  }
  if (!post.seoDescription) {
    issues.push('Hiányzik a meta description');
    score -= 10;
  }
  if (!post.excerpt) {
    issues.push('Hiányzik a kivonat');
    score -= 5;
  }
  if ((post.wordCount || 0) < 700) {
    issues.push('Vékony tartalom: 700 szó alatt');
    score -= 10;
  }
  if (!group) {
    issues.push('Nincs fordítási csoporthoz rendelve');
    score -= 20;
  }
  if (SLUG_MIGRATIONS[post.slug]) {
    issues.push(`Sérült slug; javasolt új slug: ${SLUG_MIGRATIONS[post.slug]}`);
    score -= 15;
  }

  let action = 'KEEP_REVISE';
  let priority = 'P2';
  let targetUrl = '';

  if (MERGE_TARGETS[post.slug]) {
    action = 'MERGE_AFTER_EDITORIAL_REVIEW';
    priority = 'P1';
    targetUrl = postUrl(post.language, MERGE_TARGETS[post.slug]);
    issues.push('Erős keresési szándék-átfedés a sürgősségi/hétvégi fogorvos cikkel');
  }
  if (SLUG_MIGRATIONS[post.slug]) {
    action = 'MIGRATE_SLUG_WITH_308';
    priority = 'P0';
    targetUrl = postUrl(post.language, SLUG_MIGRATIONS[post.slug]);
  }

  return {
    score: Math.max(0, score),
    action,
    priority,
    targetUrl,
    issues: issues.join('; '),
  };
}

async function main() {
  const outputPath = path.resolve(process.argv[2] || 'blog-audit-116.csv');
  const summaryPath = outputPath.replace(/\.csv$/i, '.summary.json');
  const groups = articleTranslations.map((group, index) => ({
    ...group,
    id: `topic-${String(index + 1).padStart(2, '0')}`,
  }));
  const groupBySlug = new Map();
  for (const group of groups) {
    for (const locale of LOCALES) groupBySlug.set(group[locale], group);
  }

  const posts = await fetchPosts();
  const rows = posts.map((post) => {
    const canonicalSlug = SLUG_MIGRATIONS[post.slug] || post.slug;
    const group = groupBySlug.get(canonicalSlug);
    const assessment = assessPost(post, group);
    return {
      priority: assessment.priority,
      action: assessment.action,
      qualityScore: assessment.score,
      translationGroup: group?.id || '',
      language: post.language,
      category: post.category,
      title: post.title,
      currentUrl: postUrl(post.language, post.slug),
      targetUrl: assessment.targetUrl,
      publishedAt: post.publishedAt,
      updatedAt: post._updatedAt,
      wordCount: post.wordCount,
      author: post.authorName || '',
      medicalReviewer: post.medicalReviewerName || '',
      issues: assessment.issues,
    };
  });

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n');

  const actionCounts = Object.fromEntries(
    Object.entries(Object.groupBy(rows, (row) => row.action)).map(([key, value]) => [key, value.length]),
  );
  const summary = {
    generatedAt: new Date().toISOString(),
    posts: posts.length,
    translationGroups: groups.length,
    mappedPosts: posts.filter((post) => groupBySlug.has(SLUG_MIGRATIONS[post.slug] || post.slug)).length,
    languages: Object.fromEntries(
      Object.entries(Object.groupBy(posts, (post) => post.language)).map(([key, value]) => [key, value.length]),
    ),
    crownDentalAuthored: posts.filter((post) => !post.authorName || post.authorName === 'Crown Dental').length,
    actionCounts,
  };

  await writeFile(outputPath, `${csv}\n`);
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, summaryPath, ...summary }, null, 2));
}

await main();
