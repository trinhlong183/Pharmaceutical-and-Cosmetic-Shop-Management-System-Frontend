"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SkinTypeCard from "@/components/ui/SkinTypeCard";
import {
  Smartphone,
  Camera,
  Sparkles,
  Download,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import Link from "next/link";

const MobileAppPage = () => {
  const skinTypes = [
    {
      type: "Da khô",
      description: "AI phân tích và đề xuất sản phẩm dưỡng ẩm chuyên sâu",
      color: "bg-blue-100 text-blue-800",
      gradientFrom: "from-blue-300",
      gradientTo: "to-cyan-200",
      icon: "💧",
    },
    {
      type: "Da dầu",
      description: "Đề xuất sản phẩm kiểm soát dầu và thu nhỏ lỗ chân lông",
      color: "bg-green-100 text-green-800",
      gradientFrom: "from-green-300",
      gradientTo: "to-emerald-200",
      icon: "🌿",
    },
    {
      type: "Da hỗn hợp",
      description: "Phân tích từng vùng da và đưa ra giải pháp phù hợp",
      color: "bg-purple-100 text-purple-800",
      gradientFrom: "from-purple-300",
      gradientTo: "to-pink-200",
      icon: "⚖️",
    },
    {
      type: "Da nhạy cảm",
      description: "Lựa chọn sản phẩm an toàn, không gây kích ứng",
      color: "bg-pink-100 text-pink-800",
      gradientFrom: "from-pink-300",
      gradientTo: "to-rose-200",
      icon: "🌸",
    },
    {
      type: "Da lão hóa",
      description: "Đề xuất các sản phẩm chống lão hóa hiệu quả",
      color: "bg-orange-100 text-orange-800",
      gradientFrom: "from-orange-300",
      gradientTo: "to-yellow-200",
      icon: "⏰",
    },
    {
      type: "Da mụn",
      description: "Phân tích mức độ mụn và đưa ra liệu trình điều trị",
      color: "bg-red-100 text-red-800",
      gradientFrom: "from-red-300",
      gradientTo: "to-pink-200",
      icon: "🎯",
    },
  ];

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "AI Phân Tích Da",
      description:
        "Chụp ảnh da mặt và nhận kết quả phân tích chi tiết trong vài giây",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Đề Xuất Thông Minh",
      description:
        "AI đưa ra gợi ý sản phẩm phù hợp 100% với tình trạng da của bạn",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "An Toàn & Chính Xác",
      description:
        "Công nghệ AI được đào tạo bởi các chuyên gia da liệu hàng đầu",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Theo Dõi Tiến Trình",
      description:
        "Ghi nhận sự thay đổi của da theo thời gian và điều chỉnh liệu trình",
    },
  ];

  const appScreenshots = [
    {
      title: "Chụp ảnh phân tích",
      image: "/images/app-camera.jpg",
      description: "Giao diện chụp ảnh thân thiện",
    },
    {
      title: "Kết quả phân tích",
      image: "/images/app-analysis.jpg",
      description: "Báo cáo chi tiết về tình trạng da",
    },
    {
      title: "Sản phẩm đề xuất",
      image: "/images/app-products.jpg",
      description: "Danh sách sản phẩm được cá nhân hóa",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                <Zap className="w-5 h-5 mr-2" />
                Công nghệ AI tiên tiến
              </Badge>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Ứng dụng
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  {" "}
                  AI Skin Analysis
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-pink-100 leading-relaxed">
                Phân tích da mặt bằng AI, đề xuất sản phẩm hoàn hảo cho từng
                loại da. Trải nghiệm beauty-tech thế hệ mới ngay trên điện
                thoại!
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-pink-50 text-lg px-8 py-4"
                >
                  <Download className="w-6 h-6 mr-2" />
                  Tải App iOS
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  <Download className="w-6 h-6 mr-2" />
                  Tải App Android
                </Button>
              </div>

              <div className="flex items-center gap-6 text-pink-100">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>50K+ lượt tải</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-transparent"></div>
                    <div className="p-6 text-center">
                      <Smartphone className="w-20 h-20 mx-auto mb-4 text-white" />
                      <p className="text-white text-lg font-medium">
                        AI Skin Analysis
                      </p>
                      <p className="text-pink-200 text-sm mt-2">
                        Chụp ảnh để bắt đầu phân tích
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-pink-400 rounded-full opacity-40 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 text-lg px-4 py-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Tính năng nổi bật
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tại sao chọn ứng dụng của chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ứng dụng độc quyền với công nghệ AI phân tích da tiên tiến nhất,
              giúp bạn tìm ra sản phẩm hoàn hảo cho làn da của mình
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skin Types Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              AI phân tích mọi loại da
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Công nghệ AI của chúng tôi có thể nhận diện và phân tích chính xác
              tất cả các loại da khác nhau
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skinTypes.map((skin, index) => (
              <SkinTypeCard
                key={index}
                type={skin.type}
                description={skin.description}
                color={skin.color}
                gradientFrom={skin.gradientFrom}
                gradientTo={skin.gradientTo}
                icon={skin.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Giao diện thân thiện, dễ sử dụng
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trải nghiệm người dùng được thiết kế tối ưu cho mọi lứa tuổi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {appScreenshots.map((screenshot, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="aspect-[9/16] bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl mx-auto max-w-xs relative overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent"></div>
                    <div className="p-8 text-center flex flex-col justify-center h-full">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 text-white" />
                      <p className="text-white text-lg font-medium">
                        {screenshot.title}
                      </p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {screenshot.title}
                </h3>
                <p className="text-gray-600">{screenshot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Bắt đầu hành trình làm đẹp thông minh
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Tải ứng dụng ngay hôm nay và khám phá sản phẩm hoàn hảo dành riêng
            cho làn da của bạn
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-pink-50 text-lg px-8 py-4"
            >
              <Download className="w-6 h-6 mr-2" />
              Tải App Store
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              <Download className="w-6 h-6 mr-2" />
              Tải Google Play
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-pink-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Miễn phí tải xuống</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Không quảng cáo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Shop */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            Muốn mua sắm ngay bây giờ? Khám phá cửa hàng online của chúng tôi
          </p>
          <Link href="/products">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              Khám phá sản phẩm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MobileAppPage;
