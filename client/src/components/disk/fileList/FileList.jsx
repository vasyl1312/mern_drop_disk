import React from 'react'
import './fileList.css'
import { useSelector } from 'react-redux'
import File from './file/File'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

const FileList = () => {
  const files = useSelector((state) => state.files.files)
  if (files.length === 0) return <div className="loader">Файлів не знайдено</div>

  return (
    <div className="filelist">
      <div className="filelist__header">
        <div className="filelist__name">Назва</div>
        <div className="filelist__date">Дата</div>
        <div className="filelist__size">Розмір</div>
      </div>
      <TransitionGroup>
        {files.map((file) => (
          <CSSTransition key={file._id} timeout={500} classNames={'file'} exit={false}>
            <File file={file} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}

export default FileList
