'use client';

import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  buttonText: string;
  popular?: boolean;
  includes: string[];
}

interface PricingSectionProps {
  plans: PricingPlan[];
}

function PricingSwitch({ onSwitch }: { onSwitch: (value: string) => void }) {
  const [selected, setSelected] = useState('0');

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border p-1"
        style={{
          background: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {['Monthly', 'Yearly'].map((label, i) => {
          const val = String(i);
          return (
            <button
              key={label}
              onClick={() => handleSwitch(val)}
              className={cn(
                'relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors',
                selected === val ? 'text-white' : ''
              )}
              style={{ color: selected === val ? '#fff' : 'var(--text-secondary)' }}
            >
              {selected === val && (
                <motion.span
                  layoutId="pricing-switch"
                  className="absolute top-0 left-0 h-10 w-full rounded-full"
                  style={{
                    background: 'linear-gradient(to top, var(--accent-primary), var(--accent-primary-hover))',
                    boxShadow: '0 2px 12px var(--accent-glow)',
                    border: '2px solid var(--accent-primary)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PricingSection({ plans }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div ref={pricingRef} className="relative">
      <div className="mb-8">
        <PricingSwitch onSwitch={togglePricingPeriod} />
      </div>

      <div className="grid md:grid-cols-3 max-w-5xl gap-4 mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
          >
            <div
              className={cn(
                'relative rounded-xl border p-0 overflow-hidden',
                plan.popular ? 'z-20' : 'z-10'
              )}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-card))'
                  : 'var(--bg-card)',
                borderColor: plan.popular ? 'var(--accent-primary)' : 'var(--border-color)',
                boxShadow: plan.popular ? '0 -13px 60px 0 var(--accent-glow)' : 'none',
              }}
            >
              <div className="flex flex-col space-y-1.5 p-6 text-left">
                <div className="flex justify-between">
                  <h3 className="text-3xl mb-2 font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {plan.name}
                  </h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    $
                    <NumberFlow
                      format={{ currency: 'USD' }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-semibold"
                    />
                  </span>
                  <span className="ml-1" style={{ color: 'var(--text-secondary)' }}>
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
              </div>

              <div className="p-6 pt-0">
                <button
                  className="w-full mb-6 p-4 text-lg rounded-xl font-semibold transition-all duration-200"
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(to top, var(--accent-primary), var(--accent-primary-hover))'
                      : 'var(--bg-tertiary)',
                    color: plan.popular ? '#fff' : 'var(--text-primary)',
                    border: `1px solid ${plan.popular ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    boxShadow: plan.popular ? '0 4px 20px var(--accent-glow)' : 'none',
                  }}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <h4 className="font-medium text-base mb-3" style={{ color: 'var(--text-primary)' }}>
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full grid place-content-center"
                          style={{ background: 'var(--text-tertiary)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
