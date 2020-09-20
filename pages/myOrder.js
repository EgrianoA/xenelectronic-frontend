import { useState, useEffect } from 'react';
import { Row, Col, Modal, Popconfirm, Tabs, Button, Icon } from 'antd';
import axios from 'axios';
import Router from 'next/router';
import openNotification from '../components/_shared/open-notification'
import headers from '../components/_shared/headers';
import '../styles/scss/order.scss'
import convertToRp from '../helpers/convertToRp'

const myOrder = () => {
    const { TabPane } = Tabs
    const [keys, setKeys] = useState("1")
    const [cartList, setCartList] = useState([])
    const [orderList, setOrderList] = useState([])
    const [userLoggedIn, setUserLoggedIn] = useState(false)
    const [visible, setVisible] = useState(false)
    const [modalContent, setModalContent] = useState()

    useEffect(() => {
        checkLoginStatus()
        fetchCart()
        fetchOrder()
    }, [])

    const checkLoginStatus = () => {
        if (localStorage.getItem('token')) {
            setUserLoggedIn(true)
        } else {
            Router.push('/')
        }
    }
    const fetchCart = () => {
        axios
            .get(process.env.API + `/order/viewMyCart`, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    if (res.data.data.products.length > 0) {
                        console.log(res.data.data.products)
                        setCartList(res.data.data.products)
                    } else {
                        setCartList([])
                    }
                } else {
                    setCartList([])
                    console.log(res.data)
                }
            })
            .catch(err => {
                console.log(err)
            });
    }
    const fetchOrder = () => {
        axios
            .get(process.env.API + `/order/viewMyOrderHistory`, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    console.log(res.data.data)
                    setOrderList(res.data.data)
                } else {
                    setOrderList([])
                    console.log(res.data)
                }
            })
            .catch(err => {
                setOrderList([])
                console.log(err)
            });
    }

    const addQty = item => {
        const query = {
            products: {
                qty: item.qty + 1,
                products: item.products._id,
                name: item.products.name
            }
        }
        updateCartValue(query)
    }

    const decQty = item => {
        if (item.qty - 1 == 0) {
            deleteFromCart(item)
        } else {
            const query = {
                products: {
                    qty: item.qty - 1,
                    products: item.products._id,
                    name: item.products.name
                }
            }
            updateCartValue(query)
        }
    }

    const updateCartValue = query => {
        axios
            .post(process.env.API + `/order/updateCart`, query, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    openNotification('success', 'Berhasil mengubah qty ' + query.products.name, '')
                    fetchCart()
                } else {
                    openNotification('error', 'Gagal mengubah qty ' + query.products.name, '')
                }
            }).catch(err => {
                console.log(err)
                openNotification('error', 'Gagal mengubah qty ' + query.products.name, '')
            });
    }

    const deleteFromCart = item => {
        const query = {
            products: {
                products: item.products._id
            }
        }
        axios
            .post(process.env.API + `/order/removeFromCart`, query, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    openNotification('success', 'Berhasil menghapus ' + item.products.name + ' dari keranjang', '')
                    fetchCart()
                } else {
                    openNotification('error', 'Gagal menghapus ' + item.products.name + ' dari keranjang', '')
                }
            }).catch(err => {
                console.log(err)
                openNotification('error', 'Gagal menghapus ' + item.products.name + ' dari keranjang', '')
            });
    }

    const changeKey = key => {
        setKeys(key)
    }

    const checkout = () => {
        setKeys("1")
        axios
            .get(process.env.API + `/order/submitToPayment`, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    setModalContent(res.data.data)
                    setVisible(true)
                    openNotification('success', 'Berhasil Checkout Cart', '')
                    fetchCart()
                    fetchOrder()
                    setCartList([])
                } else {
                    openNotification('error', 'Gagal Checkout Cart', res.data.message)
                }
            }).catch(err => {
                console.log(err)
                openNotification('error', 'Gagal Checkout Cart', '')
            });
    }

    const showPaymentTutorial = (order) => {
        const query = {
            order: order._id
        }
        axios
            .post(process.env.API + `/order/viewPaymentDetailByOrder`, query, headers(localStorage.getItem('token')))
            .then(res => {
                if (res.data.data) {
                    console.log(res.data.data)
                    setModalContent(res.data.data)
                    setVisible(true)
                } else {
                    console.log(res.data)
                }
            }).catch(err => {
                console.log(err)
            });
    }

    const orderStatusCard = (orderStatus) => {
        if (orderStatus === 'AWAITING PAYMENT') {
            return { border: '2px solid #05a9f0' }
        }
    }

    const orderStatus = (orderStatus) => {
        if (orderStatus === 'AWAITING PAYMENT') {
            return { color: '#05a9f0' }
        }
        if (orderStatus === 'PAID') {
            return { color: '#05f063' }
        }
    }

    return (
        <div>
            { userLoggedIn && (
                <div className='homePage'>
                    <div className="header">
                        <Row>
                            <Col span={3}>
                                <div className="menu">
                                    <Icon type="home" onClick={() => Router.push('/')} className="homeButton" />
                                </div>
                            </Col>
                            <Col span={17}>
                                <div align="center">
                                    <h1>XE</h1>
                                    <p>XenElectronics</p>
                                </div>
                            </Col>
                        </Row>
                        <hr className='headDivider' />
                    </div>
                    <div className='orderPage'>
                        <center>
                            <h2>{localStorage.getItem('username')}'s Orders List</h2>
                        </center>
                        <Modal
                            className="modalPayment"
                            footer={null}
                            visible={visible}
                            onCancel={() => setVisible(false)}
                        >
                            {modalContent && (
                                <div>
                                    <center>
                                        <h3>Silahkan Selesaikan pembayaran anda</h3>
                                        <h4>Silahkan ikuti tata cara dibawah ini</h4>
                                    </center>
                                    <ol type="1">
                                        <li>Pilih TRANSFER <span>{'>'}</span> TRANSFER TO <span><b>BANK ABANGAN</b></span> VIRTUAL ACCOUNT</li>
                                        <li>Masukkan kode VA berikut ini : <span><b>{modalContent.vaNumber}</b></span></li>
                                        <li>Pastikan nominal yang dimunculkan sudah sesuai. Total tagihan: <span><b>{convertToRp(parseInt(modalContent.total))}</b></span></li>
                                        <li>{'Pesanan anda akan terproses otomatis ketika anda selesai melakukan transfer'}</li>
                                    </ol>
                                </div>
                            )}
                        </Modal>
                        <Tabs activeKey={keys} onChange={changeKey}>
                            <TabPane tab="Order History" key="1">
                                {orderList.length < 1 && (
                                    <h3>No Order History</h3>
                                )}
                                {orderList.length > 0 && (
                                    <div className="orderList">
                                        <h3>Order History List</h3>
                                        {orderList && orderList.length > 0 && (
                                            orderList.map((order) => {
                                                return (
                                                    <div className='orderHistoryCard' style={orderStatusCard(order.orderStatus)}>
                                                        <div className="orderHistoryCardContent" >
                                                            <Row>

                                                                <Col xs={24} md={5} lg={4}>
                                                                    <center>
                                                                        <p style={orderStatus(order.orderStatus)}>{order.orderStatus}</p>
                                                                        {order.orderStatus === 'AWAITING PAYMENT' && (
                                                                            <button className="payButton" onClick={() => showPaymentTutorial(order)}><a><Icon type='dollar' /><span> How To Pay</span></a></button>
                                                                        )}
                                                                    </center>
                                                                </Col>
                                                                <Col xs={24} md={15} lg={16}>
                                                                    <ul type="1">
                                                                        {order.products && order.products.length > 0 && (
                                                                            order.products.map((products) => {
                                                                                return (
                                                                                    <li>{products.products.name + ' (Qty: ' + products.qty + ')'}</li>
                                                                                )
                                                                            }))}
                                                                    </ul>
                                                                </Col>
                                                                <Col xs={24} md={4} lg={4}>
                                                                    <center>
                                                                    <p>Total Price</p>
                                                                    <p>{convertToRp(parseInt(order.total))}</p>
                                                                    </center>
                                                                </Col>

                                                            </Row>
                                                        </div>
                                                    </div>
                                                )
                                            }))}
                                    </div>
                                )
                                }
                            </TabPane>
                            {cartList.length > 0 && (
                                <TabPane tab="Cart" key="2">
                                    <div className="cartList">
                                        <h3>Cart List</h3>
                                        {cartList && cartList.length > 0 && (
                                            cartList.map((cart) => {
                                                return (

                                                    <div className='itemsCard'>
                                                        <Row>
                                                            <Col xs={24} md={5} lg={5} xl={4}>
                                                                <img className="cartImg" src={cart.products.image} />
                                                            </Col>
                                                            <Col xs={24} md={11} lg={14} xl={16}>
                                                                <p className="cartProductName">{cart.products.name}</p>
                                                            </Col>
                                                            <Col xs={24} md={8} lg={5} xl={4}>
                                                                <div className="cartItemPrice">
                                                                    <center>
                                                                        <Row>
                                                                            <Col xs={8}>
                                                                                <button onClick={() => decQty(cart)} className="decButton"><a><Icon type='minus-circle' /></a></button>
                                                                            </Col>
                                                                            <Col xs={8}>
                                                                                <p>Qty: {cart.qty}</p>
                                                                            </Col>
                                                                            <Col xs={8}>
                                                                                <button onClick={() => addQty(cart)} className="addButton"><a><Icon type='plus-circle' /></a></button>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <p>{convertToRp(parseInt(cart.products.price * cart.qty))}</p>
                                                                        </Row>
                                                                        <Row>
                                                                            <Popconfirm
                                                                                placement="leftTop"
                                                                                title="Apakah anda yakin mau hapus item ini?"
                                                                                onConfirm={() => deleteFromCart(cart)}
                                                                                okText="Hapus"
                                                                                cancelText="Batal"
                                                                            >
                                                                                <button className="deleteButton"><a><Icon type='delete' /><span> Delete this item</span></a></button>
                                                                            </Popconfirm>
                                                                        </Row>
                                                                    </center>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            }))}
                                        <Row>
                                            <button className="checkoutButton" onClick={checkout}><a><Icon type='shopping-cart' /><span> Checkout</span></a></button>
                                        </Row>
                                    </div>
                                </TabPane>
                            )}
                        </Tabs>
                    </div>
                </div>
            )
            }
        </div >
    )
}
export default myOrder;