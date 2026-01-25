'use client';

import { BusinessCategory, PressPilotSaaSInput, SupportedLanguageCode } from '@/types/presspilot';

export type SaaSInputFormValue = PressPilotSaaSInput;

interface SaaSInputFormProps {
  value: SaaSInputFormValue;
  onChange: (value: SaaSInputFormValue) => void;
  onPreview: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const languageOptions: SupportedLanguageCode[] = ['en', 'es', 'fr', 'it', 'ar'];
const categoryOptions: BusinessCategory[] = [
  'service',
  'restaurant_cafe',
  'ecommerce',
  'fitness',
  'corporate',
  'local_store',
  'portfolio',
  'other'
];

export default function SaaSInputForm({ value, onChange, onPreview, disabled, isLoading }: SaaSInputFormProps) {
  const updateValue = (next: Partial<SaaSInputFormValue>) => {
    onChange({
      ...value,
      ...next
    });
  };

  const handleBrandChange = (partial: Partial<SaaSInputFormValue['brand']>) => {
    const nextBrand = {
      ...value.brand,
      ...partial
    };

    let nextModes = value.modes;
    if (partial.business_category) {
      nextModes = {
        ...value.modes,
        business_category: partial.business_category,
        restaurant: null,
        ecommerce: null
      };
    }

    updateValue({ brand: nextBrand, modes: nextModes });
  };

  const handleNarrativeChange = (partial: Partial<SaaSInputFormValue['narrative']>) => {
    updateValue({ narrative: { ...value.narrative, ...partial } });
  };

  const handleLanguageChange = (partial: Partial<SaaSInputFormValue['language']>) => {
    const nextPrimary = partial.primary_language ?? value.language.primary_language;
    updateValue({
      language: {
        ...value.language,
        ...partial,
        rtl_required: nextPrimary === 'ar'
      }
    });
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      aria-label="PressPilot SaaS Input form"
      onSubmit={(event) => {
        event.preventDefault();
        onPreview();
      }}
    >
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="block font-medium text-neutral-700">Business Name</span>
          <input
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            placeholder="Joes Pizza House"
            value={value.brand.business_name}
            onChange={(event) => handleBrandChange({ business_name: event.target.value })}
            disabled={disabled}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="block font-medium text-neutral-700">Business Description</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            placeholder="Long-form copy about the business"
            value={value.narrative.description_long}
            onChange={(event) => handleNarrativeChange({ description_long: event.target.value })}
            rows={4}
            disabled={disabled}
            required
          />
        </label>

        <label className="block text-sm">
          <span className="block font-medium text-neutral-700">Primary Language</span>
          <select
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            value={value.language.primary_language}
            onChange={(event) =>
              handleLanguageChange({ primary_language: event.target.value as SupportedLanguageCode })
            }
            disabled={disabled}
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="block font-medium text-neutral-700">Business Category</span>
          <select
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            value={value.brand.business_category}
            onChange={(event) =>
              handleBrandChange({ business_category: event.target.value as BusinessCategory })
            }
            disabled={disabled}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold text-white transition ${disabled
          ? 'bg-neutral-400'
          : isLoading
            ? 'bg-neutral-700'
            : 'bg-neutral-900 hover:bg-neutral-800'
          }`}
        disabled={disabled}
      >
        {isLoading ? 'Generating Preview…' : 'Preview Designs'}
      </button>
    </form>
  );
}
