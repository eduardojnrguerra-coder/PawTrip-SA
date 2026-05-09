import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleCache = new Map();

function loadTsModule(relativePath) {
  const filename = path.join(root, relativePath);
  if (moduleCache.has(filename)) {
    return moduleCache.get(filename).exports;
  }

  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  moduleCache.set(filename, module);
  const localRequire = (specifier) => {
    if (specifier.startsWith('@/')) {
      const localPath = `src/${specifier.slice(2)}${path.extname(specifier) ? '' : '.ts'}`;
      return loadTsModule(localPath);
    }

    if (specifier.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filename), specifier);
      const relative = path.relative(root, `${resolved}${path.extname(resolved) ? '' : '.ts'}`);
      return loadTsModule(relative);
    }

    return require(specifier);
  };
  const sandbox = {
    module,
    exports: module.exports,
    require: localRequire,
    console,
    process,
  };

  vm.runInNewContext(compiled, sandbox, { filename });
  return module.exports;
}

const { blogPosts } = loadTsModule('src/data/blog.ts');
const { products } = loadTsModule('src/data/products.ts');
const productSlugs = new Set(products.map((product) => product.slug));
const blogSlugs = new Set();
const errors = [];
const warnings = [];

function recordMissingProducts(post, fieldName, slugs = []) {
  slugs.forEach((slug) => {
    if (!productSlugs.has(slug)) {
      errors.push(`${post.slug}: ${fieldName} references missing product slug "${slug}".`);
    }
  });
}

blogPosts.forEach((post) => {
  if (!post.slug) {
    errors.push('A blog post is missing a slug.');
    return;
  }

  if (blogSlugs.has(post.slug)) {
    errors.push(`Duplicate blog slug "${post.slug}".`);
  }
  blogSlugs.add(post.slug);

  if (!post.image) {
    warnings.push(`${post.slug}: missing image; BlogImage fallback will render.`);
  } else if (post.image.startsWith('/')) {
    const imagePath = path.join(root, 'public', post.image);
    if (!fs.existsSync(imagePath)) {
      warnings.push(`${post.slug}: image "${post.image}" does not exist; BlogImage fallback will render.`);
    }
  }

  if (!Array.isArray(post.outline)) {
    errors.push(`${post.slug}: outline is missing or is not an array.`);
  }

  if (!Array.isArray(post.sections)) {
    errors.push(`${post.slug}: sections is missing or is not an array.`);
  } else if (post.sections.length < 3) {
    errors.push(`${post.slug}: expected at least 3 sections, found ${post.sections.length}.`);
  }

  recordMissingProducts(post, 'relatedProductSlugs', Array.isArray(post.relatedProductSlugs) ? post.relatedProductSlugs : []);
  recordMissingProducts(post, 'recommendedProductSlugs', Array.isArray(post.recommendedProductSlugs) ? post.recommendedProductSlugs : []);

  if (post.ctaBundleSlug && !productSlugs.has(post.ctaBundleSlug)) {
    errors.push(`${post.slug}: ctaBundleSlug references missing product slug "${post.ctaBundleSlug}".`);
  }
});

blogPosts.forEach((post) => {
  const relatedArticleSlugs = Array.isArray(post.relatedArticleSlugs) ? post.relatedArticleSlugs : [];
  relatedArticleSlugs.forEach((slug) => {
    if (!blogSlugs.has(slug)) {
      errors.push(`${post.slug}: relatedArticleSlugs references missing blog slug "${slug}".`);
    }
  });
});

warnings.forEach((warning) => console.warn(`[blog data warning] ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`[blog data error] ${error}`));
  process.exit(1);
}

console.log(`Blog data OK: ${blogPosts.length} posts, ${blogSlugs.size} unique slugs checked.`);
