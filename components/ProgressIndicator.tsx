'use client';

interface ProgressIndicatorProps {
  isPreviewLoading: boolean;
  isGenerateLoading: boolean;
  hasInput: boolean;
  hasPreview: boolean;
  selectionMade: boolean;
  kitsRequested: boolean;
  hasDownloads: boolean;
}

export default function ProgressIndicator({
  isPreviewLoading,
  isGenerateLoading,
  hasInput,
  hasPreview,
  selectionMade,
  kitsRequested,
  hasDownloads
}: ProgressIndicatorProps) {
  const steps = [
    { label: 'Inputs normalized', complete: hasInput },
    { label: 'Variations', complete: hasPreview },
    { label: 'Selection', complete: selectionMade },
    { label: 'Kits requested', complete: kitsRequested },
    { label: 'Downloads ready', complete: hasDownloads }
  ];

  let message = 'Fill in your business info to generate a preview.';

  if (isPreviewLoading) {
    message = 'Generating preview designs…';
  } else if (isGenerateLoading) {
    message = 'Generating WordPress theme and static site…';
  } else if (hasDownloads) {
    message = 'Downloads ready. Use the links below to download your kits.';
  } else if (hasPreview) {
    message = 'Preview ready. Choose a variation below, then generate your kits.';
  }

  return (
    <div className="space-y-2 rounded border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-700">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 animate-pulse rounded-full bg-neutral-900" aria-hidden />
        <p>{message}</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    step.complete ? 'bg-neutral-900' : 'bg-neutral-300'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`h-px w-8 ${
                      steps[index + 1].complete ? 'bg-neutral-900' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 text-center">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
