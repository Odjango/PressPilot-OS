export default function Screenshots() {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold">Screenshots coming soon.</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-48 rounded-2xl bg-gray-200 shadow-inner"
            aria-label="Screenshot placeholder"
          />
        ))}
      </div>
    </section>
  );
}
