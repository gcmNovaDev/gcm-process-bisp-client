'use client'

import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function DropdownHelp({ align }: {
  align?: 'left' | 'right'
}) {
  return (
    <Menu as="div" className="relative inline-flex">
      {({ open }) => (
        <>
          <Menu.Button
            className={`w-8 h-8 flex items-center justify-center bg-primary-50 hover:bg-primary-100 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full ${open && 'bg-primary-100'
              }`}
          >
            <span className="sr-only">Need help?</span>
            <InfoOutlinedIcon className='text-primary-700 dark:text-slate-400' />
          </Menu.Button>
          <Transition
            as="div"
            className={`origin-top-right z-10 absolute top-full min-w-[11rem] bg-white dark:bg-slate-800 border border-app-gray-300 dark:border-slate-700 py-1.5 rounded-[20px] shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'
              }`}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="text-xs font-semibold text-app-gray-200 dark:text-slate-500 uppercase pt-1.5 pb-2 px-3">Need help?</div>
            <Menu.Items as="ul" className="focus:outline-none">
              <Menu.Item as="li">
                {({ active }) => (
                  <Link className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-primary-700 dark:text-indigo-400' : 'text-primary-800 dark:text-indigo-500'}`} href="#0">
                    <svg className="w-3 h-3 fill-current text-primary-700 dark:text-indigo-500 shrink-0 mr-2" viewBox="0 0 12 12">
                      <rect y="3" width="12" height="9" rx="1" />
                      <path d="M2 0h8v2H2z" />
                    </svg>
                    <span>Documentation</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item as="li">
                {({ active }) => (
                  <Link className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-primary-700 dark:text-indigo-400' : 'text-primary-800 dark:text-indigo-500'}`} href="#0">
                    <svg className="w-3 h-3 fill-current text-primary-700 dark:text-indigo-500 shrink-0 mr-2" viewBox="0 0 12 12">
                      <path d="M10.5 0h-9A1.5 1.5 0 000 1.5v9A1.5 1.5 0 001.5 12h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 0zM10 7L8.207 5.207l-3 3-1.414-1.414 3-3L5 2h5v5z" />
                    </svg>
                    <span>Support Site</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item as="li">
                {({ active }) => (
                  <Link className={`font-medium text-sm flex items-center py-1 px-3 ${active ? 'text-primary-700 dark:text-indigo-400' : 'text-primary-800 dark:text-indigo-500'}`} href="#0">
                    <svg className="w-3 h-3 fill-current text-primary-700 dark:text-indigo-500 shrink-0 mr-2" viewBox="0 0 12 12">
                      <path d="M11.854.146a.5.5 0 00-.525-.116l-11 4a.5.5 0 00-.015.934l4.8 1.921 1.921 4.8A.5.5 0 007.5 12h.008a.5.5 0 00.462-.329l4-11a.5.5 0 00-.116-.525z" />
                    </svg>
                    <span>Contact us</span>
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}