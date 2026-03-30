import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SetupWrapperProps extends React.ComponentProps<'div'> {
  currentStepIndex: number;
  children: React.ReactNode;
}

const steps = [
  { title: 'Set Up Authentication', url: '/setup/auth' },
  { title: 'Install Apps & Extensions', url: '/setup/integrations' },
  { title: 'Import Bookmarks', url: '/setup/import' },
];

export const Onboarding = ({ currentStepIndex, children }: SetupWrapperProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh w-full items-start justify-center px-3 py-16 text-left">
      <div className={`setup-wrapper flex w-full flex-col items-stretch gap-4 md:w-3xl`}>
        <nav className="mb-8 w-full">
          <div className="flex w-full items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className={`flex flex-col items-center transition-all duration-200 ${
                    currentStepIndex > index
                      ? 'cursor-pointer'
                      : currentStepIndex === index
                        ? 'cursor-default'
                        : 'cursor-default opacity-50'
                  }`}
                  onClick={() => currentStepIndex > index && navigate(step.url)}
                >
                  <div
                    className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStepIndex > index
                        ? 'bg-primary text-secondary'
                        : currentStepIndex === index
                          ? 'bg-primary text-secondary'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStepIndex > index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px flex-1 ${currentStepIndex > index ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
};
