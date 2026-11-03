import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface ModalActionLargeProps {
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
}

export default function ModalActionLarge({
  children,
  isOpen,
  setIsOpen,
  maxWidth = '5xl'
}: ModalActionLargeProps) {
    
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10001]" onClose={() => setIsOpen(false)}>
        
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-out duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Modal wrapper */}
        <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4 sm:p-6">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in-out duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <Dialog.Panel className={`bg-white rounded-[20px] shadow-2xl ${maxWidthClasses[maxWidth]} w-full max-h-full relative overflow-hidden flex flex-col`}>
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-all"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                  <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                </svg>
              </button>

              {/* Modal content */}
              <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
                {children}
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
