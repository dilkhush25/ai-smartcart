import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Bot,
  User,
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

const dockItems = [
  {
    title: 'Home',
    icon: <Home className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/',
  },
  {
    title: 'Dashboard',
    icon: <BarChart3 className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/dashboard',
  },
  {
    title: 'Inventory',
    icon: <Package className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/inventory',
  },
  {
    title: 'Checkout',
    icon: <ShoppingCart className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/checkout',
  },
  {
    title: 'Raw Materials',
    icon: <Bot className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/raw-materials',
  },
  {
    title: 'Invoices',
    icon: <FileText className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/invoices',
  },
  {
    title: 'Login',
    icon: <User className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/login',
  },
  {
    title: 'Admin',
    icon: <Shield className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
    href: '/admin-login',
  },
];

export function AppDock() {
  const location = useLocation();

  return (
    <div className='fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50'>
      <Dock className='items-end pb-3'>
        {dockItems.map((item, idx) => (
          <DockItem
            key={idx}
            className={`aspect-square rounded-full transition-colors ${
              location.pathname === item.href 
                ? 'bg-primary/20 dark:bg-primary/30' 
                : 'bg-gray-200 dark:bg-neutral-800'
            }`}
          >
            <DockLabel>{item.title}</DockLabel>
            <Link to={item.href} className="flex items-center justify-center w-full h-full">
              <DockIcon>{item.icon}</DockIcon>
            </Link>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}