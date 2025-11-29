import React from 'react';
import type { Provider } from '@/types/gpu';

interface InfrastructureTabProps {
  selectedProvider: Provider;
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  selectedProvider,
}) => {
  return (
    <div className="flex h-full flex-col justify-center space-y-3">
      <div className="text-fg-muted/70 text-xs tracking-wide uppercase mb-2">
        Infrastructure Details
      </div>

      <div className="text-xs">
        <div className="text-fg-soft leading-relaxed mb-3">
            {selectedProvider.details}
        </div>

        <div className="text-fg-muted/70 font-medium mb-2">Regional Availability</div>
        <div className="space-y-1">
            {selectedProvider.regions.map((region) => (
            <div key={region.name} className="flex justify-between items-center py-1">
                <span className="text-fg-main">{region.name}</span>
              <span className="text-fg-soft">{region.price}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
