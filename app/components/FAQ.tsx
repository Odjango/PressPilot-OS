const faqs = [
  {
    question: 'What is PressPilot?',
    answer: 'A generative engine that builds WordPress themes + static sites from one form.',
  },
  {
    question: 'Is it free?',
    answer: 'For now, yes. The MVP Studio is available for testing.',
  },
  {
    question: 'What does the generator create?',
    answer: 'A full kit: theme.json, block patterns, static export, and preview.',
  },
  {
    question: 'Can I use this for clients?',
    answer: 'Yes — each kit is production-ready.',
  },
];

export default function FAQ() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-semibold">FAQ</h2>
      <div className="space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-semibold">{item.question}</h3>
            <p className="mt-2 text-lg text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
