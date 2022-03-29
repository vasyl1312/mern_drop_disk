const Router = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
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

      const HashPassword = await bcrypt.hash(password, 15)
      const user = new User({ email, password: HashPassword })
      await user.save()
      return res.json({ message: 'User has been created' })
    } catch (e) {
      console.log(e)
      res.send({ message: 'Server error' })
    }
  }
)

module.exports = router
