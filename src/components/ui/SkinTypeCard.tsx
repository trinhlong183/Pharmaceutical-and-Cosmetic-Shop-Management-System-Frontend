import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface SkinTypeCardProps {
  type: string;
  description: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon?: string;
}

const SkinTypeCard: React.FC<SkinTypeCardProps> = ({
  type,
  description,
  color,
  gradientFrom,
  gradientTo,
  icon = "🔬",
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div
        className={`relative h-48 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className={`${color} mb-2`}>{type}</Badge>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-4xl opacity-70">{icon}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
        <div className="flex items-center text-sm text-purple-600 group-hover:text-purple-800">
          <CheckCircle className="w-4 h-4 mr-2" />
          AI phân tích chính xác 95%
        </div>
      </CardContent>
    </Card>
  );
};

export default SkinTypeCard;
