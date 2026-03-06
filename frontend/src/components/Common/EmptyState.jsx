import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data',
  description = 'Start by creating your first item',
  action = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <Icon className="text-text mb-4" size={64} />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-muted mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
