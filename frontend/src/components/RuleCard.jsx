export default function RuleCard({ title, text }) {
  return (
    <article className="rounded-xl border border-line bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_18px_rgba(15,23,42,0.07)]">
      <h3 className="text-sm font-bold text-brand-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </article>
  )
}
