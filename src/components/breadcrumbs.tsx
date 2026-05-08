import Link from 'next/link';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.path}>
            {isLast ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
