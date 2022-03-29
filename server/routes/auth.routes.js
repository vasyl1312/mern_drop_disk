const Router = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

const router = new Router()

router.post(
  '/registration',
  [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 symbols and shorter than 12').isLength({
      min: 3,
      max: 12,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Uncorrect request', errors })
      }
      const { email, password } = req.body
      const candidate = await User.findOne({ email })

      if (candidate) {
        return res.status(400).json({ message: `User with email ${email} already exists` })
      } //якщо емейлу немає то створюємо користувача, попередньо захеширувавши пароль

      const HashPassword = await bcrypt.hash(password, 7)
      const user = new User({ email, password: HashPassword })
      await user.save()
      return res.json({ message: 'User has been created' })
    } catch (e) {
      console.log(e)
      res.send({ message: 'Server error' })
    }
  }
)

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }) // шукаємо користувача в базі
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPassValid = bcrypt.compareSync(password, user.password) //порівнюємо зашифровані паролі в базі
    if (!isPassValid) {
      //якщо паролі не співпадають
      return res.status(404).json({ message: 'Invalid password' })
    }

    const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' })
    return res.json({
      //після створення токена його треба повернути на клієнт
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    })
  } catch (e) {
    console.log(e)
    res.send({ message: 'Server error' })
  }
})

module.exports = router
