export function can(user, action, resource = null) {
  if (!user || !user.role) return false;
  if (user.role === 'manager') return true; // Manager can do everything in UI

  // Sales specific rules
  if (user.role === 'sales') {
    switch (action) {
      case 'view:all_opportunities': return false;
      case 'view:all_contacts': return false;
      case 'edit:opportunity': return resource?.ownerId === user.uid;
      case 'edit:contact': return resource?.ownerId === user.uid;
      case 'reassign': return false;
      case 'edit:stages': return false;
      case 'export:all': return false;
      case 'view:ranking': return false;
      case 'delete:contact': return false;
      default: return false;
    }
  }
  return false;
}
