import { useState } from 'react'
import { useI18n } from '../../app/i18n'
import type { CategoryPreset, ExpenseCategory } from '../../types'
import { PALETTE, PRESET_META, createCategory } from '../../domain/partition'
import { useNumberInput } from '../../hooks/useNumberInput'
import { cn } from '../../lib/cn'
import { Button } from '../../components/ui/Button'
import { AffixedInput, Field, Input } from '../../components/ui/Field'
import { Chip } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { TrashIcon } from '../../components/ui/Icon'

const PRESET_ORDER: CategoryPreset[] = [
  'housing',
  'utilities',
  'cards',
  'food',
  'transport',
  'health',
  'education',
  'leisure',
  'savings',
  'debt',
  'personal',
  'other',
  'custom',
]

const EMOJI_CHOICES = [
  '🏠', '💡', '💳', '🛒', '🚗', '🩺', '🎓', '🎬', '🏦', '🧾', '👕', '📦',
  '✨', '🍽️', '✈️', '🎮', '👶', '🐾', '💼', '🛠️', '💊', '📱', '☕', '🧹',
]

interface CategoryDialogProps {
  open: boolean
  /** `null` = crear una categoría nueva. */
  category: ExpenseCategory | null
  onClose: () => void
  onSave: (category: ExpenseCategory) => void
  onRemove: (id: string) => void
}

/**
 * Alta y edición de una categoría de gasto: nombre, emoji, color y monto.
 * El color es el que aparece en la torta, por eso se ofrece desde aquí.
 */
export function CategoryDialog({ open, category, onClose, onSave, onRemove }: CategoryDialogProps) {
  const { t, currencySymbol } = useI18n()
  const [draft, setDraft] = useState<ExpenseCategory>(() => category ?? createCategory('housing'))
  const amount = useNumberInput(draft.amount, (value) => setDraft((previous) => ({ ...previous, amount: value })))

  // Al abrir (o cambiar la categoría objetivo) se recarga el borrador:
  // ajuste de estado durante el render, sin efectos ni carreras.
  const dialogKey = open ? (category?.id ?? 'new') : null
  const [prevKey, setPrevKey] = useState<string | null>(dialogKey)
  if (prevKey !== dialogKey) {
    setPrevKey(dialogKey)
    if (open) setDraft(category ?? createCategory('other'))
  }

  const presetLabel = t(`presets.${draft.preset}.label`)
  const isCustom = draft.preset === 'custom'
  const canSave = isCustom ? draft.label.trim().length > 0 : true

  const changePreset = (preset: CategoryPreset) => {
    const meta = PRESET_META[preset]
    setDraft((previous) => ({
      ...previous,
      preset,
      emoji: meta.emoji,
      color: meta.color,
    }))
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({ ...draft, label: draft.label.trim() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? t('partition.editCategory') : t('partition.newCategory')}
      description={t('partition.categoriesHint')}
      footer={
        <div className="flex items-center justify-between gap-3">
          {category ? (
            <Button
              variant="ghost"
              icon={<TrashIcon className="h-4 w-4" />}
              onClick={() => onRemove(category.id)}
            >
              {t('common.delete')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <Field label={t('partition.presetOf')}>
          <div className="flex flex-wrap gap-2">
            {PRESET_ORDER.map((preset) => (
              <Chip
                key={preset}
                selected={draft.preset === preset}
                onClick={() => changePreset(preset)}
                icon={<span>{PRESET_META[preset].emoji}</span>}
              >
                {t(`presets.${preset}.label`)}
              </Chip>
            ))}
          </div>
        </Field>

        <Field
          label={t('partition.categoryName')}
          htmlFor="category-name"
          hint={isCustom ? undefined : `${presetLabel} · ${t(`presets.${draft.preset}.hint`)}`}
        >
          <Input
            id="category-name"
            value={draft.label}
            placeholder={presetLabel}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, label: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('partition.emoji')}>
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-surface-2 p-2">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-pressed={draft.emoji === emoji}
                  onClick={() => setDraft((previous) => ({ ...previous, emoji }))}
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-xl text-lg transition',
                    draft.emoji === emoji
                      ? 'bg-surface shadow-sm ring-2 ring-primary'
                      : 'hover:bg-surface',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t('partition.color')}>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface-2 p-2.5">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-pressed={draft.color === color}
                  aria-label={color}
                  onClick={() => setDraft((previous) => ({ ...previous, color }))}
                  className={cn(
                    'h-8 w-8 rounded-full transition',
                    draft.color === color ? 'ring-2 ring-offset-2 ring-text' : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </Field>
        </div>

        <Field label={t('common.amount')} htmlFor="category-amount">
          <AffixedInput
            id="category-amount"
            inputMode="decimal"
            prefix={currencySymbol}
            value={amount.value}
            onChange={amount.onChange}
            placeholder="0"
          />
        </Field>
      </div>
    </Modal>
  )
}
