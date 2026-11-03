import { CheckCircle } from '@mui/icons-material';

export type Step = {
  id: number;
  title: string;
  completed: boolean;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  changeStep: (step: number) => void;
};

export default function CQFHStepper({
  steps,
  currentStep,
  changeStep,
}: StepperProps) {
  return (
    <div className='w-full flex flex-col md:flex-row justify-between p-1 gap-1 bg-white dark:bg-slate-700 rounded-xl'>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`p-3 flex items-center gap-1 rounded-lg ${
            currentStep == index ? 'bg-primary-300' : 'bg-transparent'
          }`}
          onClick={() => changeStep(index)}
          role='button'
        >
          {currentStep > index ? (
            <span>
              <CheckCircle sx={{ color: '#52ccde', fontSize: '30px' }} />
            </span>
          ) : (
            <span
              className={`flex items-center justify-center border-2 rounded-full min-w-[30px] w-[30px] min-h-[30px] h-[30px] text-base font-normal ${
                currentStep == index
                  ? 'border-white text-white bg-primary-300'
                  : 'border-neutral-500 text-neutral-500 bg-transparent'
              }`}
            >
              {index + 1 < 10 ? `0${index + 1}` : index + 1}
            </span>
          )}

          <span className='flex flex-col gap-1'>
            <h6
              className={`font-normal text-sm ${
                currentStep == index ? 'text-white' : 'text-neutral-600'
              }`}
            >
              {step.title}
            </h6>
            <p
              className={`font-normal text-xs ${
                currentStep == index ? 'text-neutral-800' : 'text-neutral-400'
              }`}
            >
              {currentStep > index ? 'Completa' : 'Sin completar'}
            </p>
          </span>
        </div>
      ))}
    </div>
  );
}