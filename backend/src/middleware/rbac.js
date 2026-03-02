const PERMISSIONS = {
  ADMIN: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'branches:read', 'branches:create', 'branches:update', 'branches:delete',
    'products:read', 'products:create', 'products:update', 'products:delete',
    'invoices:read', 'invoices:create', 'invoices:refund',
    'inventory:read', 'inventory:adjust', 'inventory:count',
    'transfers:read', 'transfers:create', 'transfers:approve',
    'reports:read', 'reports:export',
    'activity:read',
    'customers:read', 'customers:create', 'customers:update', 'customers:delete',
    'categories:read', 'categories:create', 'categories:update', 'categories:delete',
  ],
  BRANCH_MANAGER: [
    'users:read',
    'branches:read',
    'products:read', 'products:create', 'products:update',
    'invoices:read', 'invoices:create', 'invoices:refund',
    'inventory:read', 'inventory:adjust', 'inventory:count',
    'transfers:read', 'transfers:create', 'transfers:approve',
    'reports:read', 'reports:export',
    'activity:read',
    'customers:read', 'customers:create', 'customers:update',
    'categories:read',
  ],
  CASHIER: [
    'products:read',
    'invoices:read', 'invoices:create',
    'inventory:read',
    'customers:read', 'customers:create',
    'categories:read',
  ],
  WAREHOUSE: [
    'products:read', 'products:create', 'products:update',
    'inventory:read', 'inventory:adjust', 'inventory:count',
    'transfers:read', 'transfers:create',
    'categories:read',
  ],
  VIEWER: [
    'products:read',
    'invoices:read',
    'inventory:read',
    'branches:read',
    'reports:read',
    'categories:read',
  ],
};

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' });
    }

    next();
  };
};

const branchAccess = (req, res, next) => {
  if (req.user.role === 'ADMIN') return next();

  const branchId = req.params.branchId || req.body.branchId || req.query.branchId;
  if (branchId && req.user.branchId && branchId !== req.user.branchId) {
    return res.status(403).json({ message: 'ليس لديك صلاحية الوصول لهذا الفرع' });
  }

  next();
};

module.exports = { authorize, branchAccess, PERMISSIONS };
