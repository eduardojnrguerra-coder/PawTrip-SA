'use client';

import { useState } from 'react';
import type { DbCategory } from '@/lib/supabase/admin';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function AdminCategoryForm({
  category,
  action,
  submitLabel,
}: {
  category?: DbCategory;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [isSaving, setIsSaving] = useState(false);

  function handleNameChange(nextName: string) {
    setName(nextName);
    if (!slugTouched) setSlug(slugify(nextName));
  }

  return (
    <form action={action} className="adminFormGrid" onSubmit={() => setIsSaving(true)}>
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <label className="field">
        <span>Name</span>
        <input className="input" name="name" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
      </label>
      <label className="field">
        <span>Slug</span>
        <input
          className="input"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          required
        />
      </label>
      <label className="field fieldFull">
        <span>Description</span>
        <textarea className="textarea" name="description" defaultValue={category?.description ?? ''} rows={3} />
      </label>
      <label className="field">
        <span>Image URL</span>
        <input className="input" name="imageUrl" defaultValue={category?.image_url ?? ''} />
      </label>
      <label className="field">
        <span>Sort order</span>
        <input className="input" name="sortOrder" type="number" defaultValue={category?.sort_order ?? 0} />
      </label>
      <label className="adminToggle">
        <input type="checkbox" name="isActive" defaultChecked={category ? category.is_active : true} />
        <span>{category?.is_active === false ? 'Inactive' : 'Active'}</span>
      </label>
      <div className="field fieldFull">
        <button className="button buttonPrimary buttonSheen" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
