import { ChevronDown } from 'lucide-react'
import { Accordion } from 'radix-ui'
import { Button, Redact } from './shared'

const QA = [
  {
    q: 'What is an abliterated model?',
    a: 'An open-weight model with its refusal direction removed. Researchers found that refusing is controlled by a single direction in the model’s activations. We find it for each model and project it out of the weights, so the model answers instead of declining. Everything else it learned stays put.',
  },
  {
    q: 'Is it worse than the original?',
    a: 'Barely. Across MMLU-Pro, GSM8K and HumanEval our builds land within half a point of stock on average, and we publish the numbers for every model on its docs page. If a build drops more than a point, we don’t ship it.',
  },
  {
    q: 'Do you log my prompts?',
    a: 'No. Prompts and completions are held in memory for the length of the request and dropped. We keep token counts per API key for billing, and nothing else. Nothing is used for training.',
  },
  {
    q: 'Is there anything you don’t allow?',
    a: 'Yes, a short list. The models will answer; what you do with the answers is on you as the account holder. Our terms prohibit sexual content involving minors and using the API to target real people, and we respond to valid legal process. Accounts that break the terms are closed.',
  },
  {
    q: 'Can I use it from my existing app?',
    a: 'If it talks to OpenAI, it talks to nodeny. Set the base URL to https://api.nodeny.ai/v1, use your nodeny key, and pick a model name from the pricing table.',
  },
  {
    q: 'Can I run the weights myself?',
    a: 'Yes. Every build is published on Hugging Face under the original model’s license. We run them so you don’t have to rent and babysit GPUs.',
  },
]

export function Faq() {
  return (
    <section className="grid gap-10 px-6 py-20 md:grid-cols-[1fr_1.5fr] md:gap-16 md:px-12 md:py-28">
      <div>
        <p className="mb-4 font-mono text-[12.5px] text-accent">[ faq ]</p>
        <h2 className="heading relative text-[clamp(2.1rem,4vw,3rem)]">
          <Redact>Frequently asked</Redact> <Redact delay={160} color="var(--accent)">questions.</Redact>
        </h2>
        <p className="mt-4 max-w-xs text-[16.5px] leading-relaxed text-ink-2">
          What people ask before their first request. The docs cover the rest.
        </p>
        <Button href="#docs" variant="quiet" className="mt-7">
          Browse the docs
        </Button>
      </div>
      <Accordion.Root type="single" collapsible defaultValue="item-0" className="flex flex-col gap-2">
        {QA.map((item, i) => (
          <Accordion.Item
            key={item.q}
            value={`item-${i}`}
            className="rounded-xl border border-rule px-5 transition-colors data-[state=open]:border-accent-mid data-[state=open]:bg-accent-soft/40"
          >
            <Accordion.Header className="flex">
              <Accordion.Trigger className="group flex flex-1 items-center justify-between gap-4 py-4 text-left text-[16px] text-ink">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="pb-5 text-[15px] leading-relaxed text-ink-2">{item.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className="text-[14.5px] text-ink-2 md:col-start-2 md:-mt-6">
        Can't find your answer?{' '}
        <a href="#contact" className="text-accent underline decoration-accent-mid underline-offset-4 hover:decoration-accent">
          Ask us anything
        </a>
        . We'll answer.
      </p>
    </section>
  )
}
