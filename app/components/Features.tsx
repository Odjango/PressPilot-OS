const features = [
  'WordPress theme.json styling',
  '10+ block patterns',
  'Multilingual-ready content',
  'Clean HTML static export',
  'SEO-friendly metadata',
  'No plugins required',
];

export default function Features() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-semibold">Feature grid (6 cards)</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="bg-white rounded-2xl p-6 text-center shadow-md">
            <p className="text-lg font-semibold text-gray-900">{feature}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
