const fileService = require('../services/fileService')
const config = require('config')
const fs = require('fs')
const User = require('../models/User')
const File = require('../models/File')
const { getPath } = require('../services/fileService')
const Uuid = require('uuid')

class FileController {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body
      const file = new File({ name, type, parent, user: req.user.id })
      const parentFile = await File.findOne({ _id: parent })
      if (!parentFile) {
        file.path = name
        await fileService.createDir(file)
      } else {
        file.path = `${parentFile.path}\\${file.name}`
        await fileService.createDir(file)
        parentFile.childs.push(file._id)
        await parentFile.save()
      }
      await file.save()
      return res.json(file)
    } catch (e) {
      console.log(e)
      return res.status(400).json(e)
    }
  }

  async getFiles(req, res) {
    try {
      const { sort } = req.query
      let files
      switch (sort) {
        case 'name':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ name: 1 })
          break
        case 'type':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ type: 1 })
          break
        case 'date':
          files = await File.find({ user: req.user.id, parent: req.query.parent }).sort({ date: 1 })
          break
        default:
          files = await File.find({ user: req.user.id, parent: req.query.parent })
          break
      }
      return res.json(files)
    } catch (e) {
      console.log(e)
      return res.status(500).json({ message: 'Can not get files' })
    }
  }

  async uploadFile(req, res) {
    try {
      const file = req.files.file

      const parent = await File.findOne({ user: req.user.id, _id: req.body.parent })
      const user = await User.findOne({ _id: req.user.id })
      //чи є вільне місце на диску
      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: 'There no space on the disk' })
      }

      user.usedSpace = user.usedSpace + file.size

      let path
      //якщо є батьківська папка то треба її вказати в шляху
      if (parent) {
        path = `${config.get('filePath')}\\${user._id}\\${parent.path}\\${file.name}`
      } else {
        path = `${config.get('filePath')}\\${user._id}\\${file.name}`
      }

      //чи існує вже такий файл на такому шляху
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: 'File already exist' })
      }
      file.mv(path)

      const type = file.name.split('.').pop() //розділюємо шлях по крапках і з цього масиву берем останній елем
      let filePath = file.name
      if (parent) {
        filePath = parent.path + '\\' + file.name
      }
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      })

      //збереження файлу і полів цього користувача
      await dbFile.save()
      await user.save()

      res.json(dbFile)
    } catch (e) {
      console.log(e)
      return res.status(500).json({ message: 'Upload error' })
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id })
      const path = fileService(getPath(file))
      if (fs.existsSync(path)) {
        return res.download(path, file.name)
      }
      return res.status(400).json({ message: 'Download error' })
    } catch (e) {
      console.log(e)
      return res.status(500).json({ message: 'Download error' })
    }
  }

  async deleteFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id })
      if (!file) {
        return res.status(400).json({ message: 'File not found' })
      }
      fileService.deleteFile(file)
      await file.remove()
      return res.json({ message: 'File was successfully deleted' })
    } catch (e) {
      console.log(e)
      return res.status(400).json({ message: 'Dir is not empty' })
    }
  }

  async searchFile(req, res) {
    try {
      const searchName = req.query.search
      let files = await File.find({ user: req.user.id })
      //перевіряєм if в search передали шматок слова то по ньому і шукаєм навіть
      files = files.filter((file) => file.name.includes(searchName))
      return res.json(files)
    } catch (e) {
      console.log(e)
      return res.status(400).json({ message: 'Search error' })
    }
  }

  async uploadAvatar(req, res) {
    try {
      const file = req.files.file
      const user = await User.findById(req.user.id)
      const avatarName = Uuid.v4() + '.jpg'
      file.mv(config.get('staticPath') + '\\' + avatarName)
      user.avatar = avatarName
      await user.save()
      return res.json({ message: 'Avatar was uploaded' })
    } catch (e) {
      console.log(e)
      return res.status(400).json(user)
    }
  }

  async deleteAvatar(req, res) {
    try {
      const user = await User.findById(req.user.id)
      fs.unlinkSync(config.get('staticPath') + '\\' + user.avatar)
      user.avatar = null
      await user.save()
      return res.json(user)
    } catch (e) {
      console.log(e)
      return res.status(400).json({ message: 'Delete avatar error' })
    }
  }
}

module.exports = new FileController()
