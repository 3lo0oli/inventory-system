import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiMapPin,
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiFileText,
  FiPackage,
  FiRepeat,
  FiBarChart2,
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiX,
  FiLayers,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { label: 'لوحة التحكم', icon: FiHome, path: '/' },
  { label: 'التصنيفات', icon: FiGrid, path: '/categories' },
  { label: 'المنتجات', icon: FiBox, path: '/products' },
  { label: 'نقطة البيع', icon: FiShoppingCart, path: '/pos' },
  { label: 'الفواتير', icon: FiFileText, path: '/invoices' },
  { label: 'المخزون', icon: FiPackage, path: '/inventory' },
  { label: 'مكونات المنتجات', icon: FiLayers, path: '/components' },
  { label: 'التقارير', icon: FiBarChart2, path: '/reports' },
  { label: 'المستخدمين', icon: FiUsers, path: '/users' },
  { label: 'العملاء', icon: FiUserCheck, path: '/customers' },
  { label: 'سجل النشاطات', icon: FiActivity, path: '/activity' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { hasPermission } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-64 bg-[#1e293b] text-white
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-wide">
            نظام المخزون
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (hasPermission && !hasPermission(item.path)) {
                return null;
              }

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 px-5 py-4">
          <p className="text-xs text-slate-500 text-center">
            تم التطوير بواسطة AmrAlaa
          </p>
        </div>
      </aside>
    </>
  );
}
