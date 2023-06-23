'use client'
import { DiffEditor } from '@monaco-editor/react';
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import path from 'path';
import { useLocalStorage } from 'usehooks-ts'

// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.text())

function getText(data: any, error: any, loading: any): any {
  if (error) {
    return "Unable to find this file"
  } else if (loading) {
    return "Loading..."
  } else {
    return data
  }
}

function getTitle(file1: string | null, file2: string | null) {
  if (!(file1 && file2)) {
    return "Diff Editor"
  }

  const file1Name = path.basename(file1)
  const file2Name = path.basename(file2)

  return `${file1Name} -> ${file2Name}`
}

export default function Home() {
  const [renderSideBySide, setRenderSideBySide] = useLocalStorage('editor/renderSideBySide', false)

  const searchParams = useSearchParams()

  const pathFile1 = searchParams.get('file1')
  const pathFile2 = searchParams.get('file2')

  const { data: file1, isLoading: loadingFile1, error: errorFile1 } = useSWR(pathFile1, fetcher)
  const { data: file2, isLoading: loadingFile2, error: errorFile2 } = useSWR(pathFile2, fetcher)

  const title = getTitle(pathFile1, pathFile2)

  return (
    <div style={{height: "100vh", overflow: "hidden"}}>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
          <span className="self-center text-1xl font-semibold whitespace-nowrap dark:text-white">{title}</span>
          <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <div className="flex items-center mr-4">
                  <input
                    id="inline-checkbox"
                    type="checkbox"
                    checked={!renderSideBySide}
                    onChange={() => setRenderSideBySide(!renderSideBySide)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="inline-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Combined View</label>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <DiffEditor
        height={'100%'}
        width={'100vw'}
        theme="vs-dark"
        options={{
          renderSideBySide,
          readOnly: false,
          ignoreTrimWhitespace: true,
        }}
        language={searchParams.get('language') || "javascript"}
        original={getText(file1, errorFile1, loadingFile1)}
        modified={getText(file2, errorFile2, loadingFile2)}
      />
    </div>
  )
}
