const items = [
  'Style-aware WordPress theme.json',
  'Professional block patterns',
  'Downloadable static site',
  'Multilingual-ready structure',
  'Clean, production-safe assets',
];

export default function OneFormSection() {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-10 space-y-6">
      <h2 className="text-3xl font-semibold">One form. A complete WordPress kit.</h2>
      <p className="text-lg text-gray-600">PressPilot is a generative engine that produces:</p>
      <ul className="list-disc space-y-3 pl-5 text-lg text-gray-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-lg text-gray-600">This is the fastest path from “idea” → live WordPress site.</p>
    </section>
  );
}
