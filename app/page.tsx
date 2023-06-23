'use client'
import { DiffEditor } from '@monaco-editor/react';
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import path from 'path';
import { useLocalStorage } from 'usehooks-ts'
import { Navbar } from "flowbite-react";
import { Button, Modal } from 'flowbite-react';
import { useState } from 'react';
import urlJoin from 'url-join';

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

function joinOrFirst(directory: string | null, file: string | null) {
  if (directory && file) {
    return urlJoin(directory, file)
  } else {
    return file
  }
}

export default function Home() {
  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };

  const [renderSideBySide, setRenderSideBySide] = useLocalStorage('editor/renderSideBySide', false)

  const searchParams = useSearchParams()

  const directory = searchParams.get('directory')
  const pathFile1 = joinOrFirst(directory, searchParams.get('file1'))
  const pathFile2 = joinOrFirst(directory, searchParams.get('file2'))

  const { data: file1, isLoading: loadingFile1, error: errorFile1 } = useSWR(pathFile1, fetcher)
  const { data: file2, isLoading: loadingFile2, error: errorFile2 } = useSWR(pathFile2, fetcher)

  const title = getTitle(pathFile1, pathFile2)

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>

      <Navbar
        fluid={true}
        rounded={true}
        className="bg-white border-gray-200 dark:bg-gray-900"
      >
        <Navbar.Brand>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {title}
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <div className="flex items-center mr-4 h-full py-2">
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
            <li>
              <Button className='h-full' color="dark" onClick={() => props.setOpenModal('default')}>What is this?</Button>
            </li>
          </ul>
        </Navbar.Collapse>
      </Navbar>
      <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
        <Modal.Header>Diff Editor</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              This tool allows you to compare two files side by side.
              You can use it to compare two versions of the same file or two different files.
              The parts that are green have been added to the new file,
              and the parts that are red have been removed from the original file.
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              If you are in Combined View, the two files have been merged
              together and the parts that are green have been added to the new file,
              and the parts that are red have been removed from the original file.
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              If you are not in Combined View, the two files are shown side by side, with the original
              file on the left and the new file on the right.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="dark" onClick={() => props.setOpenModal(undefined)}>Ok</Button>
        </Modal.Footer>
      </Modal>
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
