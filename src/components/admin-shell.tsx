import Link from 'next/link';
import { FileText, Package2, Settings, Tags, LayoutDashboard, ShoppingCart, LogOut, Users, Boxes, Search } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export function AdminShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="section adminSurface">
      <div className="container adminLayout">
        <aside className="adminSidebar">
          <div className="adminSidebarBrand">
            <BrandLogo variant="full" size="sm" showTagline />
            <strong>Admin</strong>
            <p>Products, categories and orders.</p>
          </div>
          <nav className="adminNav">
            <Link href="/admin">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/admin/products">
              <Package2 size={16} /> Products
            </Link>
            <Link href="/admin/categories">
              <Tags size={16} /> Categories
            </Link>
            <Link href="/admin/kits">
              <Boxes size={16} /> Kits
            </Link>
            <Link href="/admin/orders">
              <ShoppingCart size={16} /> Orders
            </Link>
            <Link href="/admin/customers">
              <Users size={16} /> Customers
            </Link>
            <Link href="/admin/blog">
              <FileText size={16} /> Blog
            </Link>
            <Link href="/admin/marketing">
              <Search size={16} /> Marketing / SEO
            </Link>
            <Link href="/admin/settings">
              <Settings size={16} /> Settings
            </Link>
          </nav>
          <form action="/admin/logout" method="post">
            <button type="submit" className="button buttonSecondary adminLogoutButton">
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </aside>
        <div className="adminContent">
          <div className="adminPageHeader">
            <div>
              <span className="eyebrow">Internal admin</span>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
            {actions ? <div className="cardActions">{actions}</div> : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
