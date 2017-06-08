import nodemailer from 'nodemailer'
import pug from 'pug'
import juice from 'juice'
import htmlToText from 'html-to-text'
import promisify from 'es6-promisify'

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options)
  const inlined = juice(html)
  return inlined
}

exports.send = async (options) => {

  const html = generateHTML(options.filename, options)
  const mailOptions = {
    from: 'Munaib Hussain <munaibh@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: htmlToText.fromString(html)
  }
  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions)
}
