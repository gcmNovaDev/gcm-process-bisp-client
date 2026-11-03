'use client'

import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export default function DropdownNotifications({ align }: {
  align?: 'left' | 'right'
}) {
  return (
    <Menu as="div" className="relative inline-flex">
      {({ open }) => (
        <>
          <Menu.Button
            className={`w-8 h-8 flex items-center justify-center bg-primary-50 hover:bg-primary-100 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full ${
              open && 'bg-primary-100'
            }`}
          >
            <span className="sr-only">Notifications</span>
            <SettingsOutlinedIcon className='text-primary-700 dark:text-slate-400'/>
            {/* <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#182235] rounded-full"></div> */}
          </Menu.Button>
          <Transition
            as="div"
            className={`origin-top-right z-10 absolute top-full -mr-48 sm:mr-0 min-w-[20rem] bg-white dark:bg-slate-800 border border-app-gray-300 dark:border-slate-700 py-1.5 rounded-[20px] shadow-lg overflow-hidden mt-1 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="text-xs font-bold text-app-gray-700 dark:text-slate-500 uppercase pt-1.5 pb-2 px-4">Notifications</div>
            <Menu.Items as="ul" className="focus:outline-none">
              <Menu.Item as="li" className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                {({ active }) => (
                  <Link className={`block py-2 px-4 ${active && 'bg-slate-50 dark:bg-slate-700/20'}`} href="#0">
                    <span className="block text-sm font-normal text-app-gray-500 mb-2">
                      📣 <span className="text-sm font-normal text-app-gray-500 dark:text-slate-100">Edit your information in a swipe</span> Sint occaecat cupidatat non proident,
                      sunt in culpa qui officia deserunt mollit anim.
                    </span>
                    <span className="block text-xs font-normal text-app-gray-700 dark:text-slate-500">Feb 12, 2021</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item as="li" className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                {({ active }) => (
                  <Link className={`block py-2 px-4 ${active && 'bg-slate-50 dark:bg-slate-700/20'}`} href="#0">
                    <span className="block text-sm font-normal text-app-gray-500 mb-2">
                      📣 <span className="text-sm font-normal text-app-gray-500 dark:text-slate-100">Edit your information in a swipe</span> Sint occaecat cupidatat non proident,
                      sunt in culpa qui officia deserunt mollit anim.
                    </span>
                    <span className="block text-xs font-normal text-app-gray-700 dark:text-slate-500">Feb 9, 2021</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item as="li" className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                {({ active }) => (
                  <Link className={`block py-2 px-4 ${active && 'bg-slate-50 dark:bg-slate-700/20'}`} href="#0">
                    <span className="block text-sm font-normal text-app-gray-500 mb-2">
                      🚀<span className="text-sm font-normal text-app-gray-500 dark:text-slate-100">Say goodbye to paper receipts!</span> Sint occaecat cupidatat non proident, sunt
                      in culpa qui officia deserunt mollit anim.
                    </span>
                    <span className="block text-xs font-normal text-app-gray-700 dark:text-slate-500">Jan 24, 2020</span>
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