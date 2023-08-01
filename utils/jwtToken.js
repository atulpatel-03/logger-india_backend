// Create Token and saving in cookie

const sendToken = async (user, statusCode, res) => {
  const token = await user.getJWTToken()

  // console.log("jwt token : ", token)
  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
    sameSite: 'None',
    secure: true,
  }

  res.cookie("token", token, options)

  res.status(statusCode).json({
    success: true,
    user,
    token,
  })

  // res.send("cookies set")
}

module.exports = sendToken
