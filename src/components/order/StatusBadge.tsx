import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShippingLog } from "@/api/shippingLogsService";
import { getUnifiedStatus, formatStatusForDisplay } from "@/utils/statusUtils";

interface StatusBadgeProps {
  orderStatus: string;
  shippingLog?: ShippingLog | null;
  isCustomerView?: boolean;
  variant?: 'default' | 'admin' | 'customer' | 'compact';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  orderStatus,
  shippingLog,
  isCustomerView = false,
  variant = 'default',
  className = ''
}) => {
  const unifiedStatus = getUnifiedStatus(orderStatus, shippingLog, isCustomerView);
  const statusDisplay = formatStatusForDisplay(
    orderStatus, 
    shippingLog, 
    isCustomerView ? 'customer' : 'admin'
  );

  const badgeContent = () => {
    switch (variant) {
      case 'admin':
        return (
          <div className="flex items-center gap-1">
            <span>{unifiedStatus.icon}</span>
            <span>{statusDisplay.text}</span>
            {shippingLog && (
              <span className="text-xs opacity-75">(Shipping)</span>
            )}
          </div>
        );
      
      case 'customer':
        return (
          <div className="flex items-center gap-1">
            <span>{unifiedStatus.icon}</span>
            <span>{unifiedStatus.displayText}</span>
          </div>
        );
      
      case 'compact':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">{unifiedStatus.icon}</span>
            <span className="text-xs">{unifiedStatus.displayText}</span>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-1">
            <span>{unifiedStatus.icon}</span>
            <span>{unifiedStatus.displayText}</span>
          </div>
        );
    }
  };

  return (
    <Badge
      variant="outline"
      className={`
        ${unifiedStatus.bgColor} 
        ${unifiedStatus.color} 
        flex items-center w-fit
        ${variant === 'compact' ? 'px-2 py-1' : 'px-3 py-1'}
        ${className}
      `}
      title={unifiedStatus.description}
    >
      {badgeContent()}
    </Badge>
  );
};

// Specialized variants for common use cases
export const CustomerStatusBadge: React.FC<Omit<StatusBadgeProps, 'isCustomerView' | 'variant'>> = (props) => (
  <StatusBadge {...props} isCustomerView={true} variant="customer" />
);

export const AdminStatusBadge: React.FC<Omit<StatusBadgeProps, 'isCustomerView' | 'variant'>> = (props) => (
  <StatusBadge {...props} isCustomerView={false} variant="admin" />
);

export const CompactStatusBadge: React.FC<StatusBadgeProps> = (props) => (
  <StatusBadge {...props} variant="compact" />
);
