function Customers() {
  const customers = [];
  const viewMode = "grid";

  return (
    <div className="p-8">
      {customers.length === 0 ? (
        <div>Empty</div>
      ) : viewMode === "list" ? (
        <div>List</div>
      ) : (
        <div>Grid</div>
      )}
    </div>
  );
}

export default Customers;