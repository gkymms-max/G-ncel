export default function Test() {
  return (
    <div>
      {true ? (
        <div>A</div>
      ) : false ? (
        <div>B</div>
      ) : (
        <div>C</div>
      )}
    </div>
  );
}