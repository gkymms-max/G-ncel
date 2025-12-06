import { useState, useEffect } from "react";

function Customers() {
  const [customers, setCustomers] = useState([]);

  return (
    <div className="p-8">
      <h1>Customers</h1>
      <div>Simple content</div>
    </div>
  );
}

export default Customers;