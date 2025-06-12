import React from "react";

type Product = {
  productId: {
    productName: string;
    price: number;
    id: string;
  };
  quantity: number;
  _id?: string;
};

type User = {
  _id: string;
  email: string;
  fullName: string;
};

type InventoryLogCardProps = {
  log: {
    _id: string;
    batch: string;
    products: Product[];
    action: string;
    status: string;
    userId: User;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
};

const InventoryLogCard: React.FC<InventoryLogCardProps> = ({ log }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white max-w-xl">
      <div className="mb-2 font-semibold text-lg">
        Batch: <span className="font-normal">{log.batch}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Action:</span> {log.action}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {log.status}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Created At:</span>{" "}
        {new Date(log.createdAt).toLocaleString()}
      </div>
      <div className="mb-2">
        <span className="font-semibold">User:</span> {log.userId?.fullName} (
        {log.userId?.email})
      </div>
      <div>
        <span className="font-semibold">Products:</span>
        <ul className="list-disc ml-6 mt-1">
          {log.products.map((p) => (
            <li key={p._id || p.productId.id}>
              <div>Product ID: {p.productId.id} </div>
              <span className="font-medium">{p.productId.productName}</span>
              {" - "}
              Quantity: {p.quantity}
              {" - "}
              Price: {p.productId.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryLogCard;
