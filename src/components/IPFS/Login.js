import React, { useState } from 'react'
import styled from '@emotion/styled'
import { getConfig } from './Config'

const Login = styled('div')`
  width: 400px;
  margin: 16px auto;
  font-size: 16px;
`

const Header = styled('h2')`
  margin-top: 0;
  margin-bottom: 0;
  background: #5483fe;
  padding: 20px;
  font-size: 1.4em;
  font-weight: normal;
  text-align: center;
  text-transform: uppercase;
  color: #fff;
`

const Logo = styled('img')`
  height: 42px;
  width: 360px;
`

const ErrorMsg = styled('h3')`
  margin-top: 0;
  margin-bottom: 0;
  padding: 10px;
  font-weight: normal;
  text-align: center;
  text-transform: uppercase;
  color: red;
`

const InputWrapper = styled('p')`
  margin-top: 0;
  margin-bottom: 0;
  padding: 12px;
`

const LoginForm = styled('form')`
  background: #ebebeb;
  padding: 12px;
`

const TextInput = styled('input')`
  box-sizing: border-box;
  display: block;
  width: 100%;
  border-width: 1px;
  border-style: solid;
  padding: 16px;
  outline: 0;
  font-family: inherit;
  font-size: 0.95em;
  background: #fff;
  border-color: #bbb;
  color: #555;
  :focus {
    border-color: #888;
  }
`

const Button = styled('input')`
  background: #5384fe;
  width: 40%;
  height: 35px;
  border-color: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 0.95em;
  margin-right: 5%;
  margin-left: 5%;
  :hover {
    background: #2c46a6;
  }
  :focus {
    border-color: #2c46a6;
  }
`

const IpfsLogin = props => {
  const [signupForm, setSignupForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [client, setClient] = useState(getConfig('TEMPORAL'))

  const signup = (email, username, password) => {
    var data = new FormData()
    data.append('username', username)
    data.append('password', password)
    data.append('email_address', email)
    var req = new XMLHttpRequest()
    req.withCredentials = false

    req.addEventListener('readystatechange', () => {
      if (req.readyState === 4) {
        let result = JSON.parse(req.responseText)
        if (result.token) {
          setErrorMsg('Confirm Your Email')
          setPassword('')
          setUsername('')
          setEmail('')
          setSignupForm(false)
        } else {
          setErrorMsg(result.response)
        }
      }
    })

    req.open('POST', client.signupDev)
    req.setRequestHeader('Cache-Control', 'no-cache')
    req.send(data)
  }

  const login = (username, password) => {
    var data = JSON.stringify({
      username: username.toString(),
      password: password.toString()
    })

    var req = new XMLHttpRequest()
    req.withCredentials = false

    req.addEventListener('readystatechange', () => {
      if (req.readyState === 4) {
        let result = JSON.parse(req.responseText)
        if (result.token) {
          window.localStorage.setItem('ipfsexpire', result.expire)
          window.localStorage.setItem('ipfstoken', result.token)
          setErrorMsg('')
          props.startAuthorizing()
        } else {
          setErrorMsg(result.message)
        }
      }
    })

    req.open('POST', client.loginDev)
    req.setRequestHeader('Cache-Control', 'no-cache')
    req.setRequestHeader('Content-Type', 'text/plain')
    req.send(data)
  }

  const handleChange = evt => {
    const { name, value } = evt.target
    name === `username`
      ? setUsername(value)
      : name === 'email'
      ? setEmail(value)
      : setPassword(value)
  }

  const handleSubmit = evt => {
    evt.preventDefault()
    signupForm ? signup(email, username, password) : login(username, password)
  }

  const handleFormChange = () => {
    setPassword('')
    setUsername('')
    setErrorMsg('')
    setEmail('')
    signupForm ? setSignupForm(false) : setSignupForm(true)
  }

  return (
    <Login>
      <Header>
        <a href="https://temporal.cloud">
          <Logo src={client.logo} />
        </a>
      </Header>
      <LoginForm onSubmit={handleSubmit}>
        <ErrorMsg>{errorMsg}</ErrorMsg>
        {signupForm && (
          <InputWrapper>
            <TextInput
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
            />
          </InputWrapper>
        )}
        <InputWrapper>
          <TextInput
            type="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={handleChange}
          />
        </InputWrapper>
        <InputWrapper>
          <TextInput
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
          />
        </InputWrapper>
        <InputWrapper>
          <Button
            type="button"
            value={signupForm ? 'Login' : 'Sign Up'}
            onClick={handleFormChange}
          />
          <Button type="submit" value={signupForm ? 'Sign Up' : 'Login'} />
        </InputWrapper>
      </LoginForm>
    </Login>
  )
}

export default IpfsLogin
