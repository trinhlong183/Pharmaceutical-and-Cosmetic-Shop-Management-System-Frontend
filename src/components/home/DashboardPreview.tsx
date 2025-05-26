import Image from "next/image";
import React from "react";

export default function DashboardPreview() {
  const stats = [
    { value: "₫24.5M", label: "Daily Sales" },
    { value: "124", label: "Orders Today" },
    { value: "38", label: "Low Stock Items" },
    { value: "14", label: "New Customers" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Powerful Dashboard & Analytics
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive overview of your business performance with our
            intuitive dashboard.
          </p>
        </div>

        <div className="bg-blue-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-8 ${
                  index < stats.length - 1 ? "border-r border-blue-500" : ""
                }`}
              >
                <p className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 md:p-8">
            <div className="bg-gray-100 rounded-lg p-4 aspect-video flex items-center justify-center">
              {/* <Image
                src="https://placehold.co/800x400/e2e8f0/1e40af?text=Interactive+Dashboard"
                alt="Dashboard Preview"
                className="max-w-full rounded shadow"
                width={800}
                height={400}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
