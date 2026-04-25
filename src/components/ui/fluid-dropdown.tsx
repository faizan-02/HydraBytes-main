"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function useClickAway(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler()
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

export interface DropdownOption {
  value: string
  label: string
  group?: string
}

interface FluidDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
  required?: boolean
}

export function FluidDropdown({ options, value, onChange, placeholder = "Select...", name, required }: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useClickAway(dropdownRef, () => setIsOpen(false))

  const selectedOption = options.find(o => o.value === value)

  const grouped = React.useMemo(() => {
    const map = new Map<string, DropdownOption[]>()
    for (const opt of options) {
      const key = opt.group ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    return map
  }, [options])

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full relative" ref={dropdownRef} style={{ zIndex: isOpen ? 50 : 1 }}>
        {name && <input type="hidden" name={name} value={value} required={required} />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            background: 'var(--bg-tertiary)',
            color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            height: '42px',
            padding: '0 1rem',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            outline: 'none',
          }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption?.label ?? placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', color: 'var(--text-tertiary)', flexShrink: 0 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.95 }}
              animate={{
                opacity: 1,
                scaleY: 1,
                transition: { type: "spring", stiffness: 500, damping: 30 },
              }}
              exit={{
                opacity: 0,
                scaleY: 0.95,
                transition: { duration: 0.15 },
              }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '100%',
                marginTop: '4px',
                zIndex: 50,
                transformOrigin: 'top',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
              role="listbox"
            >
              <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '4px' }}>
                {Array.from(grouped.entries()).map(([groupName, groupOptions], gi) => (
                  <div key={groupName || '__ungrouped'}>
                    {groupName && (
                      <div style={{
                        padding: `${gi > 0 ? '10px' : '6px'} 12px 4px`,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-tertiary)',
                      }}>
                        {groupName}
                      </div>
                    )}
                    {gi > 0 && !groupName && (
                      <div style={{ margin: '4px 12px', borderTop: '1px solid var(--border-color)' }} />
                    )}
                    {groupOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        option={opt}
                        isSelected={value === opt.value}
                        onSelect={() => {
                          onChange(opt.value)
                          setIsOpen(false)
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function DropdownItem({ option, isSelected, onSelect }: { option: DropdownOption; isSelected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        fontSize: '0.84rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        background: hovered ? 'var(--bg-tertiary)' : 'transparent',
        color: hovered || isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isSelected ? 600 : 400,
        outline: 'none',
        textAlign: 'left',
      }}
      role="option"
      aria-selected={isSelected}
    >
      <span>{option.label}</span>
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ color: 'var(--accent-primary)', flexShrink: 0, marginLeft: '8px' }}
        >
          <Check size={14} strokeWidth={2.5} />
        </motion.span>
      )}
    </motion.button>
  )
}
