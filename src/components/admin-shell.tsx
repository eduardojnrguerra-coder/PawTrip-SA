import Link from 'next/link';
import { Package2, Tags, LayoutDashboard, ShoppingCart, LogOut } from 'lucide-react';

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
            <span className="eyebrow">PawTrip SA</span>
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
            <Link href="/admin/orders">
              <ShoppingCart size={16} /> Orders
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
