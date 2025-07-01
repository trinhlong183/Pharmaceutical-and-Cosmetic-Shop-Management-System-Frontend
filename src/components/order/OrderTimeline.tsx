import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getUnifiedStatus,
  getTimelineProgress,
  TimelineStages,
  hasShippingInfo
} from "@/utils/statusUtils";
import { ShippingLog } from "@/api/shippingLogsService";

interface OrderTimelineProps {
  orderStatus: string;
  shippingLog?: ShippingLog | null;
  createdAt: string;
  isCustomerView?: boolean;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderStatus,
  shippingLog,
  createdAt,
  isCustomerView = false
}) => {
  console.log('OrderTimeline received:', {
    orderStatus,
    shippingLogStatus: shippingLog?.status,
    hasShippingLog: !!shippingLog,
    shippingLogData: shippingLog
  });
  
  const unifiedStatus = getUnifiedStatus(orderStatus, shippingLog, isCustomerView);
  const { currentStage, progress } = getTimelineProgress(orderStatus, shippingLog);
  
  // Enhanced debug logging for shipping status
  console.log('Timeline computation:', {
    unifiedStatus,
    currentStage,
    progress,
    timelineStagesLength: TimelineStages.length
  });
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{unifiedStatus.icon}</span>
            Order Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${unifiedStatus.bgColor} ${unifiedStatus.color}`}
            >
              {unifiedStatus.displayText}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {unifiedStatus.description}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Tiến độ đơn hàng</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timeline steps */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-200"></div>
          <div 
            className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
          
          {/* Timeline items */}
          <div className="relative space-y-4">
            {TimelineStages.map((stage, index) => {
              const isCompleted = currentStage >= stage.stage;
              const isCurrent = currentStage === stage.stage;
              const isPending = currentStage < stage.stage;
              
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  {/* Stage indicator */}
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? '✓' : stage.icon}
                  </div>
                  
                  {/* Stage content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold text-sm ${
                          isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {stage.title}
                        </h3>
                        <p className={`text-xs ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {stage.description}
                        </p>
                      </div>
                      
                      {/* Stage status */}
                      <div className="flex flex-col items-end text-xs">
                        {isCompleted && (
                          <span className="text-green-600 font-medium">Hoàn thành</span>
                        )}
                        {isCurrent && (
                          <span className="text-blue-600 font-medium">Đang xử lý</span>
                        )}
                        {isPending && (
                          <span className="text-gray-400">Chờ xử lý</span>
                        )}
                        
                        {/* Show timestamp for current or completed stages */}
                        {(isCompleted || isCurrent) && stage.stage === 1 && (
                          <span className="text-gray-500 mt-1">
                            {new Date(createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        
                        {/* Show order confirmation time for stage 2 if approved */}
                        {(isCompleted || isCurrent) && stage.stage === 2 && orderStatus.toLowerCase() === 'approved' && (
                          <span className="text-gray-500 mt-1">
                            Đã xác nhận
                          </span>
                        )}
                        
                        {/* Show shipping log update time for shipping stages */}
                        {(isCompleted || isCurrent) && shippingLog && shippingLog.updatedAt && stage.stage >= 3 && (
                          <span className="text-gray-500 mt-1">
                            {new Date(shippingLog.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        
                        {/* Show current shipping status if available */}
                        {isCurrent && shippingLog && shippingLog.status && stage.stage >= 3 && (
                          <span className="text-blue-600 text-xs mt-1 bg-blue-50 px-2 py-1 rounded">
                            {shippingLog.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional shipping info for customers */}
        {isCustomerView && hasShippingInfo(shippingLog) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
              📦 Thông tin vận chuyển
              {shippingLog?.status?.toLowerCase() === 'delivered' && (
                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">
                  ✅ Đã giao hàng
                </span>
              )}
            </h4>
            <div className="space-y-2 text-sm">
              {shippingLog?.status && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Trạng thái vận chuyển:</span>
                  <span className={`font-semibold px-2 py-1 rounded text-xs ${
                    shippingLog.status.toLowerCase() === 'delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {shippingLog.status}
                  </span>
                </div>
              )}
              {shippingLog?.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Mã vận đơn:</span>
                  <span className="font-mono font-semibold text-blue-900">
                    {shippingLog.trackingNumber}
                  </span>
                </div>
              )}
              {shippingLog?.carrier && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Đơn vị vận chuyển:</span>
                  <span className="font-semibold text-blue-900">
                    {shippingLog.carrier}
                  </span>
                </div>
              )}
              {shippingLog?.currentLocation && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Vị trí hiện tại:</span>
                  <span className="font-semibold text-blue-900">
                    {shippingLog.currentLocation}
                  </span>
                </div>
              )}
              {shippingLog?.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Dự kiến giao hàng:</span>
                  <span className="font-semibold text-blue-900">
                    {new Date(shippingLog.estimatedDelivery).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {shippingLog?.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Cập nhật lần cuối:</span>
                  <span className="font-semibold text-blue-900">
                    {new Date(shippingLog.updatedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              
              {/* Show delivery confirmation if status is delivered */}
              {shippingLog?.status?.toLowerCase() === 'delivered' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-lg">🎉</span>
                    <span className="font-semibold">Đã giao hàng thành công!</span>
                  </div>
                  <p className="text-green-700 text-xs mt-1">
                    Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status explanation for admin */}
        {!isCustomerView && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Ghi chú:</strong> {hasShippingInfo(shippingLog) 
              ? 'Hiển thị theo trạng thái shipping log' 
              : 'Hiển thị theo trạng thái đơn hàng (chưa có shipping log)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
