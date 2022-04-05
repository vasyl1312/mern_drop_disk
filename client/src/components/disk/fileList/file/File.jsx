import React from 'react'
import './file.css'
import dirLogo from '../../../../assets/img/dir.svg'
import fileLogo from '../../../../assets/img/file.svg'
import { useDispatch, useSelector } from 'react-redux'
import { pushToStack, setCurrentDir } from '../../../../reducers/fileReducer'
import { downloadFile } from '../../../../actions/file'
const File = ({ file }) => {
  const dispatch = useDispatch()
  const currentDir = useSelector((state) => state.files.currentDir)

  function openDirHandler(file) {
    if (file.type === 'dir') {
      dispatch(pushToStack(currentDir))
      dispatch(setCurrentDir(file._id))
    }
  }

  function downloadHandler(e) {
    e.stopPropagation()
    downloadFile(file)
  }

  return (
    <div className="file" onClick={() => openDirHandler(file)}>
      <img src={file.type === 'dir' ? dirLogo : fileLogo} alt="" className="file__img" />
      <div className="file__name">{file.name}</div>
      <div className="file__date">{file.date.slice(0, 10)}</div>
      <div className="file__size">{file.size}</div>
      {file.type !== 'dir' && (
        <button onClick={(e) => downloadHandler(e)} className="file_btn file_download">
          download
        </button>
      )}
      <button className="file_btn file_delete">delete</button>
    </div>
  )
}

export default File
