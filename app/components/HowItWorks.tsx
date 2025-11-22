const steps = [
  {
    title: 'Step 1 — Describe your business',
    description: 'Choose a design preset and fill the form.',
  },
  {
    title: 'Step 2 — Generate a kit',
    description: 'PressPilot builds the theme, patterns, and preview instantly.',
  },
  {
    title: 'Step 3 — Download & use',
    description: 'Import the theme into WordPress or deploy the static version.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="space-y-8">
      <h2 className="text-3xl font-semibold">How It Works</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-2xl font-semibold">{step.title}</h3>
            <p className="text-lg text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
