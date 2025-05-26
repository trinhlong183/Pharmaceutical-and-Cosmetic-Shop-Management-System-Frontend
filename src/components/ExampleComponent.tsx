"use client";
import React, { useEffect, useState } from "react";
import { fetchExampleData } from "../api/exampleApi";
import { ExampleData } from "../types/example";

const ExampleComponent: React.FC = () => {
  const [data, setData] = useState<ExampleData | null>(null);

  useEffect(() => {
    fetchExampleData().then(setData);
  }, []);

  if (!data) return <div className="text-center text-5xl text-blue-500">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-500">Example Data</h2>
      <p>ID: {data.id}</p>
      <p>Name: {data.name}</p>
    </div>
  );
};

export default ExampleComponent;
