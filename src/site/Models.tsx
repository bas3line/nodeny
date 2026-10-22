import { LOGOS, type Family } from './logos'

const FAMILIES: { name: string; logo: Family; count: number }[] = [
  { name: 'Llama', logo: 'meta', count: 2 },
  { name: 'Qwen', logo: 'qwen', count: 3 },
  { name: 'Mistral', logo: 'mistral', count: 2 },
  { name: 'Gemma', logo: 'gemma', count: 2 },
  { name: 'DeepSeek', logo: 'deepseek', count: 1 },
  { name: 'GLM', logo: 'glm', count: 1 },
]

export function Models() {
  return (
    <section id="models" className="scroll-mt-20 px-4 pt-14 pb-12 sm:px-6 md:px-12">
      <p className="mb-6 text-center text-[14.5px] text-ink-2">
        Refusal-free builds of the open models you already use
      </p>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-6">
        {FAMILIES.map((f) => (
          <div
            key={f.name}
            className="group flex h-[132px] flex-col items-center justify-center gap-3 bg-paper transition-colors hover:bg-tint"
          >
            <img
              src={LOGOS[f.logo]}
              alt=""
              className="size-9 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
            />
            <div className="text-center">
              <p className="font-display text-[18px] font-medium tracking-[-0.02em] text-ink">{f.name}</p>
              <p className="text-[12.5px] text-ink-3">
                {f.count} {f.count === 1 ? 'model' : 'models'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
