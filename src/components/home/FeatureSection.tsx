import React from "react";

export default function FeatureSection() {
  const features = [
    {
      icon: "💊",
      title: "Inventory Management",
      description:
        "Track your pharmaceutical and cosmetic products with real-time stock updates and alerts.",
    },
    {
      icon: "📊",
      title: "Sales Analytics",
      description:
        "Get valuable insights into your sales performance with detailed charts and reports.",
    },
    {
      icon: "👥",
      title: "Customer Profiles",
      description:
        "Maintain detailed customer information and their purchase history for better service.",
    },
    {
      icon: "🧾",
      title: "Invoice Generation",
      description:
        "Create professional invoices and receipts with automatic calculations.",
    },
    {
      icon: "📱",
      title: "Mobile Responsive",
      description:
        "Access your shop management system from any device, anywhere.",
    },
    {
      icon: "🔒",
      title: "Secure Data",
      description:
        "Your business and customer data is encrypted and securely stored.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Powerful Features for Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive system offers everything you need to run your
            pharmaceutical and cosmetic shop efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
