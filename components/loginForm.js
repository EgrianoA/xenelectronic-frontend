import { Form, Icon, Input, Button } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';
import openNotification from './_shared/open-notification'
const LoginForm = props => {
    const [isLogin, setIsLogin] = useState(true)
    const { getFieldDecorator } = props.form;
    const login = e => {
        e.preventDefault()
        props.form.validateFields((err, values) => {
            if (!err) {
                const loginValues = {
                    usernameOrEmail: values.usernameOrEmail,
                    password: values.passwordLogin
                }
                axios.post(process.env.API + `/login`, loginValues).then(res => {
                    console.log(res.data)
                    if (res.data.statusCode === 200) {
                        localStorage.clear()
                        localStorage.setItem('username', res.data.data.user.username)
                        localStorage.setItem('token', res.data.data.token)
                        openNotification('success', 'Welcome', 'Login Successful')
                        setTimeout(() => {
                            window.location.reload()
                        }, 1000)
                    } else {
                        openNotification('error', 'Username atau password salah', 'Cek kembali username atau password anda')
                    }
                })
            }
        })
    }
    const signup = e => {
        e.preventDefault()
        props.form.validateFields((err, values) => {
            if (!err) {
                const signupValues = {
                    username: values.username,
                    email : values.email,
                    phoneNumber : values.phoneNumber,
                    password: values.passwordSignUp
                }
                axios.post(process.env.API + `/signup`, signupValues).then(res => {
                    console.log(res.data)
                    if (res.data.statusCode === 200) {
                        localStorage.clear()
                        localStorage.setItem('username', res.data.data.user.username)
                        localStorage.setItem('token', res.data.data.token)
                        openNotification('success', 'Welcome', 'Signup & login Successful')
                        setTimeout(() => {
                            window.location.reload()
                        }, 1000)
                    } else {
                        openNotification('error', res.data.message, 'Cek kembali data yang anda masukan')
                    }
                })
            }
        })
    }
    return (
        <Form className="login-form">
            {isLogin && (
                <div>
                    <h1>Form Login</h1>
                    <Form.Item>
                        {getFieldDecorator('usernameOrEmail', {
                            rules: [
                                { required: true, message: 'Please input your Username or Email!' }
                            ]
                        })(<Input placeholder="Username or Email" />)}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('passwordLogin', {
                            rules: [{ required: true, message: 'Please input your Password!' }]
                        })(
                            <Input.Password
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.75)' }} />}
                                type="password"
                                placeholder="Password"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" block onClick={login}>
                            <Icon type="login" /> Login
                        </Button>
                        <Button type="default" block onClick={() => setIsLogin(false)}>
                            <span>I'm new, I doesn't have account</span>
                        </Button>
                    </Form.Item>
                </div>
            )}
            {!isLogin && (
                <div>
                    <h1>Form Signup</h1>
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [
                                { required: true, message: 'Please input your Username!' }
                            ]
                        })(<Input placeholder="Username" />)}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [
                                { type: 'email', message: 'The input is not valid email!' },
                                { required: true, message: 'Please input your email!' }
                            ]
                        })(<Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.75)' }} />} placeholder="email" />)}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('phoneNumber', {
                            rules: [{ required: true, message: 'Please input your Phone Number!' }]
                        })(<Input addonBefore="+62" placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('passwordSignUp', {
                            rules: [{ required: true, message: 'Please input your Password!' }]
                        })(
                            <Input.Password
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.75)' }} />}
                                type="password"
                                placeholder="Password"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" block onClick={signup}>
                            <span><Icon type="login" /> Signup</span>
                        </Button>
                        <Button type="default" block onClick={() => setIsLogin(true)}>
                            I already have account
                                    </Button>
                    </Form.Item>
                </div>
            )}
        </Form>
    )

}
export default LoginForm